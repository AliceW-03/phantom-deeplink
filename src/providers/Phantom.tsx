import React, { createContext, PropsWithChildren, useContext, useRef, useState } from 'react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomDeeplink } from '../utils/phantomDeeplink';
type PhantomContextType = {
  connected: boolean
  publicKey: string
  connect: () => void
  disconnect: () => void
};

const initialState: Pick<PhantomContextType, 'connected' | 'publicKey'> = {
  connected: false,
  publicKey: '',
};
// Create a context
const PhantomContext = createContext<PhantomContextType | null>(null);

// Create a provider component
export const PhantomProvider = ({ children }: PropsWithChildren) => {
  const network = WalletAdapterNetwork.Devnet;
  const [state, setState] = useState(initialState); // Initialize state
  const adapter = useRef<PhantomWalletAdapter>(new PhantomWalletAdapter())
  const linkAdapter = useRef(new PhantomDeeplink(network))
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  // Define any functions to update the state 
  const connect = async () => {
    if (isMobile) {
      return await adapter.current.connect()
    } else {
      linkAdapter.current.connect({
        appUrl: window.location.origin,
        redirectLink: window.location.origin + "onConnect",
        cluster: network,
      })
    }
    setState({
      publicKey: adapter.current.publicKey?.toString() || '',
      connected: true,
    });
  };

  const disconnect = () => {
    setState(initialState);
  };

  return (
    <PhantomContext.Provider value={{ ...state, connect, disconnect }}>
      {children}
    </PhantomContext.Provider>
  );
};

// Custom hook to use the context
export const usePhantom = () => {
  return useContext(PhantomContext);
};
