import { Outlet } from "react-router"
import { PhantomProvider } from "./providers/Phantom"
export const Layout = () => {
  return (
    <PhantomProvider>
      <Outlet />
    </PhantomProvider>
  )
}
