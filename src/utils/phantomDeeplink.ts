import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { box } from "tweetnacl"
import { PublicKey } from "@solana/web3.js"
import {
  CustomEventName,
  CustomEventDetail,
  listenMethodMap,
  ConnectionState,
} from "@/lib/types"
import bs58 from "bs58"

interface KeyPair {
  publicKey: Uint8Array
  secretKey: Uint8Array
}

export class PhantomDeeplink {
  private static KEY_STORAGE_KEY = "phantom_dapp_keypair"
  private static SESSION_KEY = "phantom_session"
  private static CONNECTION_KEY = "phantom_connection"

  // private baseUrl = "https://phantom.app/ul/v1"
  private baseUrl = "phantom://v1"
  private appUrl = "https://phantom-deeplink-delta.vercel.app"
  private keyPair: KeyPair | null = null
  private cluster: WalletAdapterNetwork
  private connectionState: ConnectionState | null = null

  private methodMap = {
    [listenMethodMap.connect]: this.onConnect.bind(this),
    [listenMethodMap.disconnect]: this.onDisconnect.bind(this),
  } as const

  constructor(cluster: WalletAdapterNetwork = WalletAdapterNetwork.Mainnet) {
    this.cluster = cluster
    this.restoreOrGenerateKeyPair()
    this.restoreConnectionState()
  }

  private restoreOrGenerateKeyPair(): void {
    const stored = localStorage.getItem(PhantomDeeplink.KEY_STORAGE_KEY)
    console.log(stored)

    if (stored) {
      const { publicKey, secretKey } = JSON.parse(stored)
      this.keyPair = {
        publicKey: new Uint8Array(publicKey),
        secretKey: new Uint8Array(secretKey),
      }
    } else {
      this.keyPair = box.keyPair()
      // 存储新生成的密钥对
      localStorage.setItem(
        PhantomDeeplink.KEY_STORAGE_KEY,
        JSON.stringify({
          publicKey: Array.from(this.keyPair.publicKey),
          secretKey: Array.from(this.keyPair.secretKey),
        })
      )
    }
  }

  private get dappPublicKey(): string {
    if (!this.keyPair) {
      this.restoreOrGenerateKeyPair()
    }
    return bs58.encode(this.keyPair!.publicKey)
  }

  private createSharedSecret(theirPublicKeyB64: string): Uint8Array {
    console.log("Creating shared secret with public key:", theirPublicKeyB64)
    const decoded = bs58.decode(theirPublicKeyB64)
    console.log("Decoded public key:", decoded)
    return box.before(decoded, this.keyPair!.secretKey)
  }

  private decryptData(
    encryptedData: string,
    nonce: string,
    sharedSecret: Uint8Array
  ): string {
    console.log("Decrypting data:", {
      encryptedData,
      nonce,
      sharedSecret: Array.from(sharedSecret),
    })

    const decryptedData = box.open.after(
      bs58.decode(encryptedData),
      bs58.decode(nonce),
      sharedSecret
    )

    if (!decryptedData) {
      throw new Error("Failed to decrypt data")
    }

    const decoder = new TextDecoder()
    const result = decoder.decode(decryptedData)
    console.log("Decrypted result:", result)
    return result
  }

  private restoreConnectionState(): void {
    const stored = localStorage.getItem(PhantomDeeplink.CONNECTION_KEY)
    if (stored) {
      this.connectionState = JSON.parse(stored)
    }
  }

  private saveConnectionState(state: ConnectionState): void {
    this.connectionState = state
    localStorage.setItem(PhantomDeeplink.CONNECTION_KEY, JSON.stringify(state))
  }

  public isConnected(): boolean {
    return !!this.connectionState?.connected
  }

  public getPublicKey(): string | null {
    return this.connectionState?.publicKey || null
  }

  public connect(): void {
    const url = new URL(`${this.baseUrl}/connect`)

    const searchParams = new URLSearchParams({
      app_url: this.appUrl,
      dapp_encryption_public_key: this.dappPublicKey,
      cluster: this.cluster,
      redirect_link: this.appUrl + "/onconnect",
    })

    window.open(`${url}?${searchParams.toString()}`, "_blank")
  }

  private onConnect(): Promise<PublicKey> {
    return new Promise((resolve, reject) => {
      const handleConnect = (
        event: CustomEvent<CustomEventDetail<CustomEventName.PHANTOM_CONNECTED>>
      ) => {
        window.removeEventListener(
          CustomEventName.PHANTOM_CONNECTED,
          handleConnect as EventListener
        )

        try {
          const detail = event.detail
          console.log("Received connection detail:", detail)

          if ("errorCode" in detail) {
            reject(new Error(`${detail.errorCode}: ${detail.errorMessage}`))
            return
          }

          const { phantom_encryption_public_key, data, nonce } = detail
          console.log("Extracted connection data:", {
            phantom_encryption_public_key,
            data,
            nonce,
          })

          const sharedSecret = this.createSharedSecret(
            phantom_encryption_public_key
          )
          const decryptedData = this.decryptData(data, nonce, sharedSecret)
          const parsed = JSON.parse(decryptedData)
          console.log("Parsed connection data:", parsed)

          const publicKey = new PublicKey(parsed.public_key)

          // 从解密的数据中获取 session
          this.saveConnectionState({
            connected: true,
            publicKey: publicKey.toString(),
            session: parsed.session, // session 在解密的数据中
          })

          resolve(publicKey)
        } catch (error) {
          console.error("Connection error:", error)
          reject(error)
        }
      }

      window.addEventListener(
        CustomEventName.PHANTOM_CONNECTED,
        handleConnect as EventListener
      )
    })
  }

  private onDisconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      window.addEventListener(CustomEventName.PHANTOM_DISCONNECTED, () => {
        resolve()
      })
    })
  }

  public async on<T extends keyof typeof this.methodMap>(
    listenMethod: T,
    callback: (data: Awaited<ReturnType<(typeof this.methodMap)[T]>>) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    try {
      const method = this.methodMap[listenMethod]
      const result = (await method()) as Awaited<
        ReturnType<(typeof this.methodMap)[T]>
      >
      callback(result)
    } catch (error) {
      console.error(error)
      onError?.(error as Error)
    }
  }

  public test() {
    const testData = {
      encryptedData:
        "5VBfJzbxZCKzTFr9m6EmnvMVozPYKi5d26KcPQcPCVvUim7g1DAD9PvxM4vJqo8qo5CuLaH3imZvKDeLaDJ4udWQCJxzRavR1NjK8TfrjDBf5hqzGtDCYCPTzCXz8cZTC4RDYgauppaPeZdxjQn6DPuEqLm1UdQZ9Fy9MEHsA1D2hdis14SD2DLws2kaX7k7XYZd1mG3Gw29jhRSqfTkjY75mso4CqUsHTUHmDCgZKtDx9FV4VJZWSBX9LtSYhLyneJCRHD7caZfN1sX3aa1q14GcpdJVLC1E4FHBXjz6BMpG3BgNw457B1JoXKzuVrxvMC3ZjWVG5jgkkYvHGVCqRMMxuzpa5nbYevcG5Lkj7iw6gn42YguphFTF9W4eNxoW75tNaydtSdH1ZFM7aKjEyGYAkRmMj3EdPUkCNsYfKoHj4CPT94ugmqkppekjuaCZuo6LD6farZ56Q",
      nonce: "PaBysremYo9j8CJURv1NDp7crr37dcr9n",
      sharedSecret: new Uint8Array([
        85, 103, 68, 185, 17, 205, 25, 146, 20, 230, 230, 194, 58, 147, 106,
        235, 80, 222, 1, 242, 165, 16, 181, 109, 40, 58, 197, 91, 80, 228, 144,
        51,
      ]),
    }

    PhantomDeeplink.testDecryption(testData)
  }

  private static testDecryption(testData: {
    encryptedData: string
    nonce: string
    sharedSecret: Uint8Array
  }) {
    try {
      console.log("Test data:", testData)

      const decryptedData = box.open.after(
        bs58.decode(testData.encryptedData),
        bs58.decode(testData.nonce),
        testData.sharedSecret
      )

      console.log("Decrypted data:", decryptedData)

      if (!decryptedData) {
        console.error("Decryption failed - null result")
        return
      }

      const decoder = new TextDecoder()
      const result = decoder.decode(decryptedData)
      console.log("Successfully decrypted:", result)
    } catch (error) {
      console.error("Decryption error:", error)
    }
  }

  public disconnect(): void {
    localStorage.removeItem(PhantomDeeplink.CONNECTION_KEY)
    this.connectionState = null
    // 触发断开连接事件
    window.dispatchEvent(new CustomEvent(CustomEventName.PHANTOM_DISCONNECTED))
  }

  // 添加签名方法
  public async signMessage(message: string): Promise<string> {
    if (!this.isConnected() || !this.connectionState?.session) {
      throw new Error("Not connected")
    }

    const url = new URL(`${this.baseUrl}/signMessage`)
    const searchParams = new URLSearchParams({
      app_url: this.appUrl,
      dapp_encryption_public_key: this.dappPublicKey,
      session: this.connectionState.session,
      message: bs58.encode(new TextEncoder().encode(message)),
    })

    window.open(`${url}?${searchParams.toString()}`, "_blank")
    // 处理签名回调...
    return ""
  }
}
