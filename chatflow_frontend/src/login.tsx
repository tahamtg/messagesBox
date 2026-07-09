import { useState, useEffect } from "react";
import axios, {type AxiosResponse, AxiosError, isAxiosError} from "axios";
import {AuthProvider, authContext} from "./authprovider";
import { useContext } from "react";
import { Usecontext } from "./context";
import { replace, useNavigate, Link } from "react-router-dom"
import './login.css'

interface Token_type{
    access : string,
    refresh :string
}

const Login = ()=>{
    const {form, setForm} = useContext(Usecontext)!
    const auth = useContext(authContext)
    const [error, setError] = useState<string | null>(null)
    const [mass, setMass] = useState<string | null>(null)
     const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    

    const toLogin = async ()=>{
        try{
            setLoading(true)
            const res = await axios.post<Token_type>("https://massagebox.runflare.run/massage/token/" ,
                {username: form.username,
                password:  form.password}
            )
                
                const have_auth = auth?.set_token(res.data.access, res.data.refresh)
                const promis = await new Promise((have_auth)=> setTimeout(have_auth, 3000))
                setError(null)
                navigate("/", {replace:true})

            
        }catch(e: any){   

            setError("نام کاربری یا رمز عبور اشتباه است")   
            setMass(null)    
            console.error("somthing is wrong!", e.response?.data)

        }finally{
            setLoading(false)
        }
               
    }

    return(
        <>

        <div className='login'>

            <section className='massage'>
            {error ?
             (<div><span>{error}</span></div>): mass ? 
              (<div><span>{mass}</span></div>): null}
            </section>

            <section className='form'>
                <form action="">
                <input type="text" placeholder="نام کاربری" value={form.username} onChange={(e)=> {setForm({...form, username: e.target.value})}}/>
                <input type="password" placeholder="رمز عبور" value={form.password} onChange={(e)=> {setForm({...form, password: e.target.value})}}/>
                <button className='button-form' onClick={toLogin}disabled={loading}>{loading? (<span>در حال بررسی...</span>): <span>ورود</span> }</button>
                <Link className='linkto' to={'../sign'}>اکانت ندارید؟ ثبت نام کنید!</Link>
                </form>
            </section>

            </div>
        </>
    )
}

export default Login