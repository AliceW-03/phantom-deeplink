 
import './App.css' 
// import Test from './test'
import { Provider } from 'react-redux'
import store from './store' 
import "@solana/wallet-adapter-react-ui/styles.css"
import Sol from './pages/sol'
import { PhantomProvider } from './providers/Phantom'; 
function App() {
  
  return (
    <Provider store={store}>  
      <PhantomProvider>
        <Sol />
      </PhantomProvider>
    </Provider>
  )
}

export default App
