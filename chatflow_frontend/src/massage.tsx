import React, { useState, useEffect ,useContext, useRef} from 'react'
import { Usecontext } from './context';
import {authContext} from './authprovider';
import './massage.css'
import  sendIcon  from './assets/send-svgrepo-com.svg'

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

const [isOpen, setIsopen] = useState(false)

const [posi, setPosi] = useState({x : 0, y : 0})

const time = useRef<number | null>(null)

const [selectId, setSelectId] = useState<number | null>(null)

const menuref = useRef<HTMLDivElement>(null)

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

    if(data.type == "message_deleted"){
        setMessages((prev)=> prev.filter((msg)=> msg.id !== data.mass_id));
        setIsopen(false);
        return;
    }
    
        console.log("RECEIVED:", data);

    if (data.type === "chat_message") {
        setMessages((prev) => [...prev, 
            {
                message: data.message,
                username: data.username,
                id: data.id,
                date: data.date,
        }
    ]);
    }
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
            type: "chat_message",
            message: newMassage,
        })
    );

    setNewMassage("");
};

const contextMenu = (e: React.MouseEvent, id: number)=>{
    e.preventDefault()
    setSelectId(id)
    setPosi({x : e.clientX, y : e.clientY})
    setIsopen(true);
};

const handler = (e: MouseEvent | TouchEvent) =>{

    const target = e.target as Node;
    if (menuref.current && !menuref.current.contains(target)){

        setIsopen(false)
    }

};

const pressFin = (e: React.PointerEvent, id: number)=>{

    if (e.pointerType !== "touch"){return}

    time.current = window.setTimeout(()=>{

        setSelectId(id)
        setPosi({x : e.clientX, y : e.clientY})
        setIsopen(true)
    
    }, 5000)

};

const setTimeOut = ()=>{

    if (time.current){
        clearTimeout(time.current)
        time.current = null;
    }

};


const delete_massage= (id_massage: number)=>{
    socket.current?.send(
      JSON.stringify({
        type: "delete_message",
        massageId : id_massage,
      })  
    )
}

        useEffect(() => {
        document.addEventListener("mousedown", handler);
        document.addEventListener("touchstart", handler);

        return () => {
            document.removeEventListener("mousedown", handler);
            document.removeEventListener("touchstart", handler);
        };

    }, []);

    const copy_massage = (id:number) =>{

        const cp_mass = message.find((msg)=> msg.id == id)
        if (!cp_mass){return}
        navigator.clipboard.writeText(cp_mass.message)
        setIsopen(false)

    }

     
return (
    <>
        <div className='back-chat'>
            <div className="header">
                <h1>massageBOX</h1>

            <section className="title-logout">

                <h2>{auth?.access && form.username}</h2>

                <button onClick={() => auth?.rm_token()}>

                {auth?.isAuth && <span>خروج</span>}

                </button>

            </section>

            </div>

            {disconnected && (
                <span style={{ color: "red" }}>{disconnected}</span>
            )}



        <div className='massages'>
         
            
            {form.username && <span>{form.username}</span>}
        <section className="par-mass">

            {message.map((messageText) => (
                <p
            key={messageText.id}
            onContextMenu={(e) => contextMenu(e, messageText.id)}
            onPointerDown={(e) => pressFin(e, messageText.id)}
            >
            {messageText.message}
        </p>
        ))}

            {isOpen && (
            <section ref={menuref} className="menudetails" style={{
            position: "absolute",
            top: posi.y,
            left: posi.x,
            width : "fit-content"
        }}>
            
            {message.map((msg)=>

            <button onClick={()=> copy_massage(msg.id)} className="copy">
                کپی
            </button>
)}
            <button onClick={() => selectId && delete_massage(selectId)} className="delete">
                حذف
            </button>

        </section>
            )}

            </section>
        </div>

            <div className="massage-text">
            <form onSubmit={post_Massage}>
                <input
                value={newMassage}
                onChange={(e) => setNewMassage(e.target.value)}
                placeholder="چیزی بنویسید"
                />

                <button type="submit">
                     <img src={sendIcon} alt="send icon" style={{ width: '20px', height: '20px' }} />
                </button>

            </form>

            </div>

        </div>

    </>
);
}

export default Massage;