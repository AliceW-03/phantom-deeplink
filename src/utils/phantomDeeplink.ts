import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { box } from "tweetnacl"
import { encodeBase64 } from "tweetnacl-util"
import { PublicKey } from "@solana/web3.js"
interface KeyPair {
  publicKey: Uint8Array
  secretKey: Uint8Array
}

export class PhantomDeeplink {
  private baseUrl = "https://phantom.app/ul/v1"
  private appUrl = "phantom-deeplink-jz5u.vercel.app"
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

  public connect(): void {
    const url = new URL(`${this.baseUrl}/connect`)

    const searchParams = new URLSearchParams({
      app_url: this.appUrl,
      dapp_encryption_public_key: this.dappPublicKey,
      cluster: this.cluster,
      redirect_link: window.location.origin + "onConnect",
    })
    window.open(`${url}?${searchParams.toString()}`, "_blank")
  }

  public onConnect( ): Promise<PublicKey> {
    return new Promise((resolve, reject) => {
      window.addEventListener("message", (event) => {
        if (event.data.type === "phantom-deeplink-connect") {
          resolve(event.data.publicKey)
        }
      })
    })
  }

  // public getKeyPair(): KeyPair {
  //   if (!this.keyPair) {
  //     this.generateNewKeyPair()
  //   }
  //   return this.keyPair!
  // }

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
