import {Routes, Route, Await, useNavigate} from 'react-router-dom'
import React, { useState, useEffect, useContext} from 'react'
import axios, {type AxiosResponse, type AxiosError, isAxiosError} from "axios";
import { Usecontext } from './context';
import * as yup from "yup";
import { authContext } from './authprovider';
import { Navigate } from 'react-router-dom';



interface api_sign{
    username : string,
    password : string
}


const Sign  = () =>{

    const {form, setForm} = useContext(Usecontext)!
    const auth = useContext(authContext)
    const [error, setError] = useState<string | null>(null)
    const [mass, setMass] = useState<string | null>(null)
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
    

    const add_user =  async () =>{

      

        const isvalid = await submit_Form()
        if(!isvalid){return}
        
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
        <div>
            {error ?
             (<div><span style={{ color: 'red' }}>{error}</span></div>): mass ? 
              (<div><span style={{ color: 'black' }}>{mass}</span></div>): null}

           
                <input type="text" placeholder='نام کاربری' value={form.username} onChange={(e)=> {setForm({...form, username: e.target.value})}} />
                <input  type="password" placeholder='رمز عبور' value={form.password} onChange={(e)=> {setForm({...form, password: e.target.value})}} />
                <button type="submit" onClick={add_user}>ثبت نام</button>
            

        </div>
    </>
)

} 

export default Sign
