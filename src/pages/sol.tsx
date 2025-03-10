// import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"

export default function Page() {
  // const { publicKey, connect, disconnect, select, wallet, wallets, connected } = useWallet() 
  return <>
    {/* {connected && <div>
      <p>Public Key: {publicKey?.toBase58()}</p>
      <p>Wallet: {wallet?.adapter.name}</p>
    </div>}
    <div>
      {wallets.map((wallet) => (
        <button onClick={() => {
          select(wallet.adapter.name)
          connect()
        }}>
          {wallet.adapter.name}
        </button>
      ))}

      <button onClick={() => {
        disconnect()
      }}>
        Disconnect
      </button>
    </div> */}
  </>
}