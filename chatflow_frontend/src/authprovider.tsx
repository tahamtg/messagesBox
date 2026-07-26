import { createContext, useEffect, useState, type JSX } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { number } from "yup";

interface context_content{
    isAuth : boolean,
    setIsAuth: React.Dispatch<React.SetStateAction<boolean>>,
    logOut: ()=> void
    currentUser: CurrentUser,
    setCurrentuser: React.Dispatch<React.SetStateAction<CurrentUser>>
}


interface CurrentUser{
    username: string,
    username_id: number
}

export const authContext = createContext <context_content | null> (null)



 export const AuthProvider = ({ children }: { children: React.ReactNode }):JSX.Element => {

    const [currentUser, setCurrentuser] = useState<CurrentUser>({
        username:"",
        username_id: 0
    })

    const [isAuth, setIsAuth] = useState(false)
    const navigate = useNavigate()

    useEffect(()=>{

    

    const check_Auth = async ()=>{
        try{
            const res = await axios.get("https://massagesbox.ir/massage/check-auth/",
            {
                withCredentials: true,
            }
        )

        setCurrentuser({
            username: res.data.username,
            username_id: res.data.username_id
        })

        if(res.data.authenticate === true){
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
            await axios.post("https://massagesbox.ir/massage/logout/",
                {},
                {
                    withCredentials:true,
                }
            )
        setIsAuth(false)
        navigate("/login", {replace: true})
    }catch(e){
        console.log("cant logout")
    }
        }


    return ( 

        <authContext.Provider value={{isAuth, setIsAuth , logOut, currentUser, setCurrentuser}}>
            {children}
        </authContext.Provider>

     );
}

 
