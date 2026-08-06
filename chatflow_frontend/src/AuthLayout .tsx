import { Outlet } from "react-router-dom"
import { AuthProvider } from "./authprovider"

const AuthLayout = () => {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}

export default AuthLayout;