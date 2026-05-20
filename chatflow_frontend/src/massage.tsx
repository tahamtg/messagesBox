import {Routes, Route} from 'react-router-dom'
import React, { useState, useEffect ,useContext, useRef} from 'react'
import axios, {type AxiosResponse, type AxiosError, isAxiosError} from "axios";
import { Usecontext } from './context';
import {authContext} from './authprovider';

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

const {form, setForm} = useContext(Usecontext)!
const auth = useContext(authContext)
const [error, setError] = useState<string | null>(null)
const [massage, setMassage] = useState<apigetmassage[]>([])
const [newMassage, setNewMassage] = useState<string>("")
const timeMassage = useRef(null)
const [typing, setTyping] = useState(false)
const socket = useRef<WebSocket | null>(null)

     useEffect(() => {
        socket.current = new WebSocket()
    }, []);



  return (
    <>

                        <div>
                        <h1>massageBOX</h1>
                        <div><h2>{form.username}</h2></div>
                        <div>{typing && (<span>{`${form.username} در حال نوشتن...`}</span>)}</div>
                        </div>
                    {error && <div><span style={{ color: 'red' }}>{error}</span></div>}
                    <div>
                        <div>
                             {massage.map((messageText, index) => ( 
                                      <p key={messageText.id}>{messageText.payam}</p>
                         ))}       
                           
                        </div>
                    </div>
                    <div>
                        <form action="" onSubmit={post_Massage}>
                        <input placeholder="چیزی بنویسید" value={newMassage} type="text" onChange={(e)=> {setNewMassage(e.target.value);}} />
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
