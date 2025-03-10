import { useMemo } from 'react';
import { createConfig, WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import './App.css'
import { metaMask } from 'wagmi/connectors'
import { sei } from 'viem/chains'
import { base } from 'viem/chains'
import { http } from 'viem'
// import Test from './test'
import { Provider } from 'react-redux'
import store from './store'
import Home from './pages/home'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import "@solana/wallet-adapter-react-ui/styles.css"
import Sol from './pages/sol'
import { PhantomProvider } from './providers/Phantom';
const rainbowConfig = createConfig({
  connectors: [metaMask()],
  chains: [base, sei],
  transports: {
    [base.id]: http(),
    [sei.id]: http(),
  },
  // ssr: true,
})
const queryClient = new QueryClient()
function App() {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      // new UnsafeBurnerWalletAdapter(),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network]
  );
  return (
    <Provider store={store}>
      {/* <WagmiProvider config={rainbowConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider locale='en'
            theme={lightTheme({
              accentColor: "rgb(0,34,82)",
              accentColorForeground: "#fff",
            })}>
            <Home />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider> */}
      {/* <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <WalletMultiButton />
            <WalletDisconnectButton />
          </WalletModalProvider>

          <Sol />
        </WalletProvider>
      </ConnectionProvider> */}

      <PhantomProvider>
        <Sol />
      </PhantomProvider>
    </Provider>
  )
}

export default App
