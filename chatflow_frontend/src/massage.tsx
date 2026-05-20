import React, { useState, useEffect ,useContext, useRef} from 'react'
import { Usecontext } from './context';
import {authContext} from './authprovider';

const Massage : React.FC = () =>{

const {form, setForm} = useContext(Usecontext)!
const auth = useContext(authContext)
const [error, setError] = useState<string | null>(null)
const [massage, setMassage] = useState<apigetmassage[]>([])
const [newMassage, setNewMassage] = useState<string>("")
const timeMassage = useRef(null)
const [typing, setTyping] = useState(false)
const socket = useRef<WebSocket | null>(null)
const [istyping, isTyping] = useState(false)
const [disconnected, setDisconnected] = useState<string | null>(null)

     useEffect(() => {
        socket.current = new WebSocket("ws://127.0.0.1:8000/ws/chat/")

        socket.current.onopen = ()=>{
            console.log("connected")
        }

        socket.current.onmessage = (event)=>{
           const data = JSON.parse(event.data)
           if (data.type == "chat_message"){
            setMassage([...massage, data])
           }
        }

        socket.current.onclose = (event)=>{
           if(event.code === 1006){
                setDisconnected("اینرنت شما قطع شده است!")
            
           }
        }

    }, []);

    const post_Massage = (event: React.FormEvent<HTMLFormElement>)=>{
        event.preventDefault()
         socket.current?.send(
            JSON.stringify({
                "message" : newMassage
            })
        )
    }
       

  return (
    <>

                        <div>
                        <h1>massageBOX</h1>
                        <div><h2>{form.username}</h2></div>
                        <div>{disconnected && (<span style={{ color: 'red' }}>{disconnected}</span>)}</div>
                        </div>
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
