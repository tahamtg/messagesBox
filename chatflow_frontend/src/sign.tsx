import {Routes, Route, Await, useNavigate} from 'react-router-dom'
import React, { useState, useEffect, useContext} from 'react'
import axios, {type AxiosResponse, type AxiosError, isAxiosError} from "axios";
import { Usecontext } from './context';
import * as yup from "yup";
import { authContext } from './authprovider';
import { Link } from 'react-router-dom';
import './sign.css'



interface api_sign{
    username : string,
    password : string
}


const Sign  = () =>{

    const {form, setForm} = useContext(Usecontext)!
    const auth = useContext(authContext)
    const [error, setError] = useState<string | null>(null)
    const [mass, setMass] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

       const schema = yup.object({
        
            username : yup.string().required("نام کاربری الزامی میباشد").min(4, "نام کاربری باید حتما 4 کاراکتر باشد"),
            password : yup.string().required().matches(/[0-9]/, "باید عدد داشته باشد")
        
    })

    const submit_Form = async () => {
        
       try {
        await schema.validate(form, {abortEarly:false})
        return schema;
      
        } catch (e) {
        console.error(e)
         setError("خطا در اعتبار سنجی");
         setMass(null)
        return;
        }
        
    }
    

    const add_user =  async (event: React.FormEvent<HTMLFormElement>) =>{

        event.preventDefault()

        const isvalid = await submit_Form()
        if(!isvalid){return}
        setLoading(true)
        const promis = await new Promise((isvalid)=> setTimeout(isvalid, 3000))
        setLoading(false)
        try{
               const res = await axios.post<api_sign>("http://127.0.0.1:8000/massage/sign-up/",
                {
                    
                username : form.username,
                password : form.password
                
                },
                { 
                    headers: { 
                    Accept: "application/json",
                    'Content-Type': 'application/json',
                },  
            
            });
            console.log("signup success:", res.status, res.data);              
            if (res.status === 201 || res.status === 200) {
                setMass("نام کاربری و پسورد با موفقیت ذخیره شد")
                setError(null)
                navigate("/login", { replace: true });
        }
        }catch(e){
            console.error(e, "Error at sending username")
            setError(`نام کاربری ${form.username} ثبلا ثبت نام کرده است، لطفا نام کاربری جدید وارد کنید!`)
        }
    }


return(
    <>

        <div className='sign'>

            <section className='massage'>
            {error ?
             (<div><span>{error}</span></div>): mass ? 
              (<div><span style={{ color: 'black' }}>{mass}</span></div>): null}
            </section>

            <section className='form'>
            <form action="" onSubmit={add_user}>
                <input type="text" placeholder='نام کاربری' value={form.username} onChange={(e)=> {setForm({...form, username: e.target.value})}} />
                <input  type="password" placeholder='رمز عبور' value={form.password} onChange={(e)=> {setForm({...form, password: e.target.value})}} />
                <button className='button-form' type="submit" disabled={loading}>{loading? (<span>در حال بررسی...</span>): <span>ثبت نام</span> }</button>
            </form>
                <Link className='linkto' to={'../login'}>اکانت دارید؟ وارد بشید!</Link>
            </section>
            
        </div>
 
    </>
)

} 

export default Sign
