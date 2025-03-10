
import './App.css' 
import "@solana/wallet-adapter-react-ui/styles.css"
import Sol from './pages/sol'
import { PhantomProvider } from './providers/Phantom';
import { RouterProvider } from 'react-router'
import { createBrowserRouter } from 'react-router'
function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <PhantomProvider> <Sol /> </PhantomProvider>
    }
  ])
  return (
    <RouterProvider router={router} />
  )
}

export default App
