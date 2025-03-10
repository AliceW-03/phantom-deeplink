import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { box } from "tweetnacl"
import { PublicKey } from "@solana/web3.js"
import {
  CustomEventName,
  CustomEventDetail,
  listenMethodMap,
} from "@/lib/types"
import bs58 from "bs58"

interface KeyPair {
  publicKey: Uint8Array
  secretKey: Uint8Array
}

export class PhantomDeeplink {
  // private baseUrl = "https://phantom.app/ul/v1"
  private baseUrl = "phantom://v1"
  private appUrl = "https://phantom-deeplink-delta.vercel.app"
  private keyPair: KeyPair | null = null
  private cluster: WalletAdapterNetwork

  private methodMap = {
    [listenMethodMap.connect]: this.onConnect.bind(this),
    [listenMethodMap.disconnect]: this.onDisconnect.bind(this),
  } as const

  constructor(cluster: WalletAdapterNetwork = WalletAdapterNetwork.Mainnet) {
    this.cluster = cluster
    this.generateNewKeyPair()
  }

  private generateNewKeyPair(): void {
    this.keyPair = box.keyPair()
  }

  private get dappPublicKey(): string {
    if (!this.keyPair) {
      this.generateNewKeyPair()
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

          resolve(new PublicKey(parsed.public_key))
        } catch (error) {
          console.error("Connection error:", error)
          reject(error)
        }
      }

      window.addEventListener(
        CustomEventName.PHANTOM_CONNECTED,
        handleConnect as EventListener
      )

      setTimeout(() => {
        window.removeEventListener(
          CustomEventName.PHANTOM_CONNECTED,
          handleConnect as EventListener
        )
        reject(new Error("Connection timeout"))
      }, 60000)
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
  // 用于加密消息的方法
  public async encrypt(
    message: string,
    theirPublicKey: Uint8Array
  ): Promise<string> {
    const ephemeralKeyPair = box.keyPair()
    const sharedSecret = box.before(theirPublicKey, this.keyPair!.secretKey)
    // ... 实现加密逻辑
    return ""
  }

  // 用于解密消息的方法
  public async decrypt(
    encryptedMessage: string,
    theirPublicKey: Uint8Array
  ): Promise<string> {
    const sharedSecret = box.before(theirPublicKey, this.keyPair!.secretKey)
    // ... 实现解密逻辑
    return ""
  }
}
