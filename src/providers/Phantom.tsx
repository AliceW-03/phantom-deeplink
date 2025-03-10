import React, { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomDeeplink } from '../utils/phantomDeeplink';
import { useLocation } from 'react-router';
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
const PhantomContext = createContext<PhantomContextType>({
  connected: false,
  publicKey: '',
  connect: () => { },
  disconnect: () => { }
});

// Create a provider component
export const PhantomProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useState(initialState); // Initialize state
  const adapter = useRef<PhantomWalletAdapter>(new PhantomWalletAdapter())
  const linkAdapter = useRef(new PhantomDeeplink(WalletAdapterNetwork.Devnet))
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const { pathname } = useLocation()
  // Define any functions to update the state 
  const connect = async () => {
    if (isMobile) {
      linkAdapter.current.connect()
    } else {
      await adapter.current.connect()
      setState({
        publicKey: adapter.current.publicKey?.toString() || '',
        connected: true,
      });
    }
  };

  const disconnect = () => {
    setState(initialState);
  };

  const pathListener =
    async (path: string) => {
      if (path === "/onConnect") {
        const publicKey = await linkAdapter.current.onConnect()
        setState({
          publicKey: publicKey.toString(),
          connected: true,
        });
      }
    }

  useEffect(() => {
    console.log(pathname, 'pathname');

    pathListener(pathname)
  }, [pathname])

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
