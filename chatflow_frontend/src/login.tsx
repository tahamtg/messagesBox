import { useState, useEffect } from "react";
import axios, {type AxiosResponse, AxiosError, isAxiosError} from "axios";
import {AuthProvider, authContext} from "./authprovider";
import { useContext } from "react";
import { Usecontext } from "./context";
import { replace, useNavigate } from "react-router-dom"

interface Token_type{
    access : string,
    refresh :string
}

const Login = ()=>{
    const {form, setForm} = useContext(Usecontext)!
    const auth = useContext(authContext)
    const [error, setError] = useState<string | null>(null)
    const [mass, setMass] = useState<string | null>(null)
    const navigate = useNavigate()
    

    const toLogin = async ()=>{
        try{
            const res = await axios.post<Token_type>("http://127.0.0.1:8000/massage/token/" ,
                {username: form.username,
                password:  form.password}
            )

           const have_auth = auth?.set_token(res.data.access, res.data.refresh)

                setMass("خوش آمدید!")
                setError(null)
                navigate("/", {replace:true})

        }catch(e: any){   

            setError("نام کاربری یا رمز عبور اشتباه است")   
            setMass(null)    
            console.error("somthing is wrong!", e.response?.data)

        }
    }

    return(
        <>
            <div>
            {error ?
             (<div><span style={{ color: 'red' }}>{error}</span></div>): mass ? 
              (<div><span style={{ color: 'black' }}>{mass}</span></div>): null}

                <div><input type="text" placeholder="نام کاربری" value={form.username} onChange={(e)=> {setForm({...form, username: e.target.value})}}/></div>
                <div><input type="password" placeholder="رمز عبور" value={form.password} onChange={(e)=> {setForm({...form, password: e.target.value})}}/></div>
                <div><button onClick={toLogin}>ورود</button></div>
            </div>
        </>
    )
}

export default Login