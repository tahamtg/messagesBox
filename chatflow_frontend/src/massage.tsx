import React, { useState, useEffect ,useContext, useRef} from 'react'
import { Usecontext } from './context';
import {authContext} from './authprovider';

interface get_data_from_websooket{
    massage : string
    username : string,
    id : number,
    date : string
}

const Massage : React.FC = () =>{

const {form, setForm} = useContext(Usecontext)!
const auth = useContext(authContext)
const [error, setError] = useState<string | null>(null)
const [massage, setMassage] = useState<get_data_from_websooket[]>([])
const [newMassage, setNewMassage] = useState<string>("")
const timeMassage = useRef(null)
const [typing, setTyping] = useState(false)
const socket = useRef<WebSocket | null>(null)
const [istyping, isTyping] = useState(false)
const [disconnected, setDisconnected] = useState<string | null>(null)

useEffect(() => {
    if (!auth?.access) return;

    socket.current = new WebSocket(
        `ws://127.0.0.1:8000/ws/chat/?token=${auth.access}`
    );

    socket.current.onopen = () => {
        console.log("connected");
    };

    socket.current.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "chat_message") {
            setMassage((prev) => [...prev, data]);
        }
    };

    socket.current.onclose = (event) => {
        if (event.code === 1006) {
            setDisconnected("اینترنت شما قطع شده است!");
        }
    };

    return () => {
        socket.current?.close();
    };
}, [auth?.access]);

const post_Massage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
            {massage.map((messageText) => (
                <p key={messageText.id}>
                    {messageText.massage}
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
