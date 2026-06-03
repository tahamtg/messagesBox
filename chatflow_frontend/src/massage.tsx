import React, { useState, useEffect ,useContext, useRef} from 'react'
import { Usecontext } from './context';
import {authContext} from './authprovider';

interface get_data_from_websooket{
    message : string
    username : string,
    id : number,
    date : string
}

const Massage : React.FC = () =>{

const {form, setForm} = useContext(Usecontext)!
const auth = useContext(authContext)
const [error, setError] = useState<string | null>(null)
const [message, setMessages] = useState<get_data_from_websooket[]>([])
const [newMassage, setNewMassage] = useState<string>("")
const timeMassage = useRef(null)
const [typing, setTyping] = useState(false)
const socket = useRef<WebSocket | null>(null)
const [istyping, isTyping] = useState(false)
const [disconnected, setDisconnected] = useState<string | null>(null)

useEffect(() => {
    if (!auth?.access) return;

    socket.current = new WebSocket(
        `ws://127.0.0.1:8000/ws/chat/general/?token=${auth.access}`
    );

    socket.current.onopen = () => {
        console.log("connected");
        setDisconnected(null);
    };

socket.current.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("RECEIVED:", data);

    setMessages((prev) => [...prev, data]);
};

    socket.current.onclose = (event) => {
        console.log("WS CLOSED", event.code, event.reason);
        if (event.code === 1006) {
            setDisconnected("ارتباط WebSocket قطع شد (سرور یا خطا)");
        }
    };

    socket.current.onerror = (e) => {
  console.log("WS ERROR:", e);
  setError("خطای WebSocket (جزئیات در console)");
};

    return () => {
        socket.current?.close();
    };
    
}, [auth?.access]);

const post_Massage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!socket.current || socket.current.readyState !== WebSocket.OPEN){
        console.error("connection to websocket is failed!")
        return
    }
    socket.current?.send(
        JSON.stringify({
            message: newMassage,
        })
    );

    setNewMassage("");
};
    
       
return (
    <>
        <div>
            <h1>massageBOX</h1>
            <h2>{form.username}</h2>

            {disconnected && (
                <span style={{ color: "red" }}>{disconnected}</span>
            )}
        </div>

        <div>
            {message.map((messageText) => (
                <p key={messageText.id}>
                    {messageText.message}
                </p>
            ))}
        </div>

        <form onSubmit={post_Massage}>
            <input
                value={newMassage}
                onChange={(e) => setNewMassage(e.target.value)}
                placeholder="چیزی بنویسید"
            />
            <button type="submit">ارسال پیام</button>
        </form>

        <button onClick={() => auth?.rm_token()}>
            {auth?.isAuth && <span>خروج</span>}
        </button>
    </>
);
}

export default Massage
