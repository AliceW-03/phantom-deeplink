import React, { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomDeeplink } from '../utils/phantomDeeplink';
import { enqueueSnackbar } from 'notistack';
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
  const [ready, setReady] = useState(false)
  const [state, setState] = useState(initialState)
  const adapter = useRef<PhantomWalletAdapter>(new PhantomWalletAdapter())
  const linkAdapter = useRef(new PhantomDeeplink(WalletAdapterNetwork.Devnet))
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

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


  useEffect(() => {
    // 检查已存在的连接
    if (linkAdapter.current.isConnected()) {
      setState({
        connected: true,
        publicKey: linkAdapter.current.getPublicKey() || '',
      })
    }

    linkAdapter.current.on('connect', (data) => {
      setState({
        publicKey: data.toString(),
        connected: true,
      })
    }, (error) => {
      enqueueSnackbar(error.message, {
        variant: 'error',
      })
    })

    setReady(true)
  }, [])


  useEffect(() => {
    linkAdapter.current.test()
  }, [linkAdapter])

  if (!ready) {
    return null // 或者返回 loading 组件
  }

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
