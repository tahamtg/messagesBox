import { useState, useEffect } from "react";
import axios, {type AxiosResponse, AxiosError, isAxiosError} from "axios";
import {AuthProvider, authContext} from "./authprovider";
import { useContext } from "react";



const Login = ()=>{
    const auth = useContext(authContext)
    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    

    const toLogin = async ()=>{
        try{
                  const res = await axios.post('http://127.0.0.1:8000/massage/token/',{username, password})

           auth?.set_token(res.data.access, res.data.refresh)

        }catch(e){

            if(axios.isAxiosError(e)){ 

            console.error("somthing is wrong!", e.response?.data)

            }else{

                console.error("unknown error!", e);
                
            }
        }
    }

    return(
        <>
            <div>
                <div><input type="text" placeholder="نام کاربری" value={username} onChange={(e)=> setUsername(e.target.value)}/></div>
                <div><input type="text" placeholder="رمز عبور" value={password} onChange={(e)=> setPassword(e.target.value)}/></div>
                <div><button onClick={toLogin}>ورود</button></div>
            </div>
        </>
    )
}

export default Login