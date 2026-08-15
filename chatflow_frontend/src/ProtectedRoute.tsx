import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import {useContext } from "react";
import { authContext } from "./authprovider";

const ProtectedRoute = ({ children }: {children: React.ReactNode}):JSX.Element => {
   
   const ctx_auth = useContext(authContext)
   
        if(!ctx_auth?.isAuth){
           return <Navigate to="/" replace/>
         }
     
       return <>{children}</>

}
 
export default ProtectedRoute;