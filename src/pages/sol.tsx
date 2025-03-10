// import { useWallet } from "@solana/wallet-adapter-react" 
import { usePhantom } from "../providers/Phantom"

export default function Page() {
  const { connect, publicKey, connected } = usePhantom()
  return <>
    {connected && <div>
      <p>Public Key: {publicKey}</p>
    </div>}
    <button onClick={() => {
      connect()
    }}>
      Connect
    </button>
    {/*  <div>
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