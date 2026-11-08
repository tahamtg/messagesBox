import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useContext } from "react";
import { authContext } from "./authprovider";

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {

    const ctx_auth = useContext(authContext)
    const location = useLocation()

    if (!ctx_auth || ctx_auth.isAuth === null || ctx_auth.isAuth === undefined) {
        return null
    }

    if (ctx_auth.isAuth === false) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    return <>{children ?? <Outlet />}</>
}

export default ProtectedRoute;
