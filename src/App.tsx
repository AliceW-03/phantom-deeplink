
import './App.css'
import "@solana/wallet-adapter-react-ui/styles.css"
import Sol from './pages/sol'
import { Layout } from './Layout';
import { OnConnect } from './pages/callback/OnConnect';
import { RouterProvider } from 'react-router'
import { createBrowserRouter } from 'react-router'
function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          index: true,
          element: <Sol />
        },
        {
          path: 'onconnect',
          element: <OnConnect />
        }
      ]
    }
  ])
  return (
    <RouterProvider router={router} />
  )
}

export default App
