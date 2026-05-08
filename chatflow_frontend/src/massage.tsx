import {Routes, Route} from 'react-router-dom'
import React, { useState, useEffect ,useContext} from 'react'
import axios, {type AxiosResponse, type AxiosError, isAxiosError} from "axios";
import { Usecontext } from './context';
import { authContext, AuthProvider } from './authprovider';

interface apierrorType {
    not_exist_massage ?: string,
    not_respone_server ?: string,
    error ?: string,
    not_exist_delete ?: string,
    server_error ?: string,
}

interface apigetmassage{
     id: number
     payam: string,
}



const Massage : React.FC = () =>{

const context = useContext(Usecontext)
const auth = useContext(authContext)
const [error, setError] = useState<string | null>(null)
const [massage, setMassage] = useState<apigetmassage[]>([])
const [newMassage, setNewMassage] = useState<string>("")



      const get_Massage = async () => {
        try {
            const res = await axios.get<apigetmassage[]>("http://127.0.0.1:8000/massage/get/");
     
            if (res?.data) {
                setMassage(res.data);
            } else {
                setError("پاسخ دریافتی از سرور نامعتبر است.");
                setMassage([]); 
            }
        } catch (e) {
            console.error("Error fetching messages:", e); 
            if (axios.isAxiosError(e)) {
                const axiosError = e as AxiosError<apierrorType>;
                if (axiosError.response?.data?.not_exist_massage) {
                    setError("پیامی دریافت نشد");
                } else if (axiosError.response?.data?.not_respone_server) {
                    setError("خطای سرور");
                } else {
                    setError("خطایی رخ داد، لطفا بعدا تلاش کنید");
                }
            } else {
                setError("خطایی ناشناخته رخ داد");
            }
            setMassage([]); 
        }
    };
         const post_Massage = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); 
        if (newMassage.trim() === '') {
            setError("لطفاً قبل از ارسال، پیامی بنویسید.");
            return;
        }
        setError(null); 
        try {
      
            await axios.post("http://127.0.0.1:8000/massage/post/", {
                payam : newMassage 
            }, {
                headers: { 
                    Accept: "application/json",
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            });
            setNewMassage(""); 
            await get_Massage();
        } catch (e) {
            console.error("Error posting message:", e);
            setError("خطا در ارسال پیام");
            if (axios.isAxiosError(e)) {
                const axiosError = e as AxiosError<apierrorType>;
                if (axiosError.response?.data?.not_exist_massage) {
                    setError("خطا در ارسال پیام2");
                } else if (axiosError.response?.data?.not_respone_server || axiosError.response?.status === 500) {
                    setError("خطای سرور");
                }
            }
        }
    };

  

     useEffect(() => {
        get_Massage();
    }, []);



  return (
    <>

                        <div>
                        <h1>massageBOX</h1>
                        <div><span>{context?.form.username}</span></div>
                        </div>
                    {error && <div><span style={{ color: 'red' }}>{error}</span></div>}
                    <div>
                        <ul>
                             {massage.map((messageText, index) => ( 
                                      <li key={messageText.id}>{messageText.payam}</li>
                         ))}       
                           
                        </ul>
                    </div>
                    <div>
                        <form action="" onSubmit={post_Massage}>
                        <input placeholder="چیزی بنویسید" value={newMassage} type="text" onChange={(e)=> {setNewMassage(e.target.value)}} />
                        <input type="submit" value="ارسال پیام" />
                        </form>
                    </div>
                    <button onClick={() => auth?.rm_token()}>
                                       {auth?.isAuth && <span>خروج</span>}
                    </button>


    </>
  );
            };

export default Massage
