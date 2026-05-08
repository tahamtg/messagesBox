import {Routes, Route, Await, useNavigate} from 'react-router-dom'
import React, { useState, useEffect, useContext} from 'react'
import axios, {type AxiosResponse, type AxiosError, isAxiosError} from "axios";
import { Usecontext } from './context';
import * as yup from "yup";
import { authContext } from './authprovider';



interface api_sign{
    username : string,
    password : string
}


const Sign  = () =>{

    const context = useContext(Usecontext)

    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

       const schema = yup.object({
        
            username : yup.string().required("نام کاربری الزامی میباشد").min(4, "نام کاربری باید حتما 4 کاراکتر باشد"),
            password : yup.string().required().matches(/[0-9]/, "باید عدد داشته باشد")
        
    })

    const submit_Form = async () => {
        
       try {
        await schema.validate(context?.form, {abortEarly:false})
        return schema;
        } catch (err: any) {
         setError(err.errors[0]);
        return;
        }
        
    }
    

    const add_user =  async (event: React.FormEvent<HTMLFormElement>) =>{

        event.preventDefault()

        submit_Form()
        
        try{
               const res = await axios.post<api_sign>("http://127.0.0.1:8000/massage/sign-up",
                {
                username : context?.form?.username,
                password : context?.form?.password
                },
                { 
                    headers: { 
                    Accept: "application/json",
                    'Content-Type': 'application/json',
                },  
            
            });
            res.data && navigate("/");
        }catch(e){
            if (axios.isAxiosError(e)){
                if(e.response?.data?.username){
                    console.error("username is already!")
                    setError(`نام کاربری ${context?.form.username} قبلا استفاده شده!`)
                }
            }
            console.error(e, "Error at sending username")
            setError("خطا در ارسال نام کاربری یا رمز عبور")
        }
    }


return(
    <>
        <div>
            <form onSubmit={add_user} action="">
                <input type="text" placeholder='نام کاربری' value={context?.form?.username} onChange={(e)=> {context?.setForm({...context?.form, username: e.target.value})}} />
                <input  type="password" placeholder='رمز عبور' value={context?.form?.password} onChange={(e)=> {context?.setForm({...context?.form, password: e.target.value})}} />
                <button type="submit" value={'ارسال'}/>
            </form>
        </div>
    </>
)

} 

export default Sign
