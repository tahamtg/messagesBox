import { createContext, useEffect, useState, type JSX } from "react";
import axios from "axios";

interface context_content{
    isAuth : boolean,
    logOut: ()=> void
}

export const authContext = createContext <context_content | null> (null)



 export const AuthProvider = ({ children }: { children: React.ReactNode }):JSX.Element => {

    const [isAuth, setIsAuth] = useState(false)

    useEffect(()=>{

    

    const check_Auth = async ()=>{
        try{
            const res = await axios.get("https://massagebox.runflare.run/massage/check-auth/",
            {
                withCredentials: true,
            }
        )
        if(res.data.authenticate == true){
            setIsAuth(true)
        }else{
            setIsAuth(false)
            return
        }
        }catch(e){
            setIsAuth(false) 
        }
    }

    check_Auth();

},[])

    const logOut = async ()=>{

        try{
            await axios.post("https://massagebox.runflare.run/massage/logout/",
                {},
                {
                    withCredentials:true,
                }
            )
        setIsAuth(false)
    }catch(e){
        console.log("cant logout")
    }
        }


    return ( 

        <authContext.Provider value={{isAuth, logOut}}>
            {children}
        </authContext.Provider>

     );
}

 
