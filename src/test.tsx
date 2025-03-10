import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { metaMask } from 'wagmi/connectors'
export default function Page() {
  const { address, isConnected, isConnecting, isDisconnected, } = useAccount()
  const { connect, } = useConnect()
  const { disconnect } = useDisconnect()
  return <>
    <button onClick={() => connect({ connector: metaMask() })}>Connect</button>
    <button onClick={() => disconnect()}>Disconnect</button>
    <div>
      <p>Address: {address}</p>
      <p>Is Connected: {isConnected ? 'Yes' : 'No'}</p>
      <p>Is Connecting: {isConnecting ? 'Yes' : 'No'}</p>
      <p>Is Disconnected: {isDisconnected ? 'Yes' : 'No'}</p>
    </div>
  </>
}