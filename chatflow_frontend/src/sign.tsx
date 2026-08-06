import {Routes, Route, Await, useNavigate} from 'react-router-dom'
import React, { useState, useEffect, useContext} from 'react'
import axios, {type AxiosResponse, type AxiosError, isAxiosError} from "axios";
import { Usecontext } from './context';
import * as yup from "yup";
import { authContext } from './authprovider';
import { Link } from 'react-router-dom';
import './sign.css'
import Logo from '../public/d862b856-2462-456f-ada2-8f3f8304c7c8.png'



interface api_sign{
    username : string,
    password : string
}


const Sign  = () =>{

    const {form, setForm} = useContext(Usecontext)!
    const auth = useContext(authContext)
    const [error, setError] = useState<string[] | null>([])
    const [mass, setMass] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

  const schema = yup.object({
    username: yup
        .string()
        .required("نام کاربری الزامی میباشد")
        .min(3, "نام کاربری باید حداقل ۳ کاراکتر باشد")
        .max(255, "نام کاربری خیلی طولانی است")
        .matches(
            /^[a-zA-Z0-9_]+$/,
            "نام کاربری فقط شامل حروف، عدد و _ باشد"
        ),

    password: yup
        .string()
        .required("رمز عبور الزامی میباشد")
        .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
});

    const submit_Form = async () => {
        
       try {
        await schema.validate(form, {abortEarly:false})
        return schema;
      
        } catch (e) {

            if(e instanceof yup.ValidationError){
                setError(e.errors)
        }else{
            setError(null)
        }

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
               const res = await axios.post<api_sign>("https://massagesbox.ir/massage/sign-up/",
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
                console.log("redirect is ok!")
                navigate("/login", { replace: true });
        }
        }catch(e:any){
           console.log(e.response?.data)
        }
    }


return(
    <>

        <div className="total-sign">

        <div className="radialback"></div>
            
        <div className='sign'>


            <div className="logo-container">
                <img src={Logo} className="logo" alt="massagesbox" />
            </div>
            <h1 className='signup-title'>ثبت نام</h1>
            <div className="info-box"> 
                <p>شرایط ثبت نام:</p> 
                <ul> <li>نام کاربری حداقل ۳ کاراکتر باشد.</li> 
                <li>نام کاربری فقط شامل حروف، عدد و _ باشد.</li> 
                <li>رمز عبور حداقل ۸ کاراکتر باشد.</li>
                <li>نام کاربری تکراری قابل استفاده نیست.</li>
                </ul> 
                </div>

            <section className='massage'>
                {error &&
                    error.map((err,index)=>(
                    <div key={index}>
                    <span>{err}</span>
                    </div>
                    ))
                }
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
        </div>
 
    </>
)

} 

export default Sign
