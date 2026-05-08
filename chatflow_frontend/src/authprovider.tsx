import { createContext, useState, type JSX } from "react";



interface context_content{
    set_token: (access: string, refresh: string)=>void
    rm_token: ()=>void
    isAuth : boolean
}

export const authContext = createContext <context_content | null> (null)

 export const AuthProvider = ({ children }: { children: React.ReactNode }):JSX.Element => {

    const [access, setAcess] = useState<string | null>(localStorage.getItem("access"))
    const [refresh, setRefresh] = useState<string | null>(localStorage.getItem("refresh"))
     

     const set_token = (access:string, refresh:string)=>{
            setAcess(access)
            setRefresh(refresh)
            localStorage.setItem("access", access)
            localStorage.setItem("refresh", refresh)
     }

     const rm_token = ()=>{
        setAcess(null)
        setRefresh(null)
        localStorage.removeItem("access")
        localStorage.removeItem("refresh")
     }

    const isAuth = Boolean(access)

   

    return ( 

        <authContext.Provider value={{set_token, rm_token, isAuth}}>
            {children}
        </authContext.Provider>

     );
}

 
