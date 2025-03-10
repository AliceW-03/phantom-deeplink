import { Outlet } from "react-router" 
import { SnackbarProvider } from "notistack"
export const Layout = () => {
  return (
    <SnackbarProvider> 
        <Outlet /> 
    </SnackbarProvider>
  )
}
