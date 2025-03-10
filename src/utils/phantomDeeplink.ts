import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { box } from "tweetnacl"
import { encodeBase64, decodeBase64 } from "tweetnacl-util"
import { PublicKey } from "@solana/web3.js"
import { CustomEventName, CustomEventDetail } from "@/lib/types"

interface KeyPair {
  publicKey: Uint8Array
  secretKey: Uint8Array
}

export class PhantomDeeplink {
  private baseUrl = "https://phantom.app/ul/v1"
  private appUrl = "https://phantom-deeplink-delta.vercel.app"
  private keyPair: KeyPair | null = null
  private cluster: WalletAdapterNetwork

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
    return encodeBase64(this.keyPair!.publicKey)
  }

  private createSharedSecret(theirPublicKeyB64: string): Uint8Array {
    const theirPublicKey = decodeBase64(theirPublicKeyB64)
    return box.before(theirPublicKey, this.keyPair!.secretKey)
  }

  private decryptData(
    encryptedData: string,
    nonce: string,
    sharedSecret: Uint8Array
  ): string {
    const decryptedData = box.open.after(
      decodeBase64(encryptedData),
      decodeBase64(nonce),
      sharedSecret
    )

    if (!decryptedData) {
      throw new Error("Failed to decrypt data")
    }

    const decoder = new TextDecoder()
    return decoder.decode(decryptedData)
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

  public onConnect(): Promise<PublicKey> {
    return new Promise((resolve, reject) => {
      const handleConnect = (
        event: CustomEvent<CustomEventDetail<CustomEventName.PHANTOM_CONNECTED>>
      ) => {
        window.removeEventListener(
          CustomEventName.PHANTOM_CONNECTED,
          handleConnect as EventListener
        )

        try {
          const { phantom_encryption_public_key, data, nonce } = event.detail

          const sharedSecret = this.createSharedSecret(
            phantom_encryption_public_key
          )

          const decryptedData = this.decryptData(data, nonce, sharedSecret)

          const { public_key } = JSON.parse(decryptedData)

          resolve(new PublicKey(public_key))
        } catch (error) {
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
