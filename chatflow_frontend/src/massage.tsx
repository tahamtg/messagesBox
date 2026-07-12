import React, { useState, useEffect ,useContext, useRef} from 'react'
import { Usecontext } from './context';
import {authContext} from './authprovider';
import { useParams } from 'react-router-dom';
import './massage.css'
import  sendIcon  from './assets/send-svgrepo-com.svg'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { number, string } from 'yup';


interface get_data_from_websooket{
    message : string,
    username : string,
    id : number,
    date : string,
    userid: number
}

interface getinfo{
    username: string,
    userid: number | null
}

const Massage : React.FC = () =>{


const auth = useContext(authContext)

const [error, setError] = useState<string | null>(null)

const [message, setMessages] = useState<get_data_from_websooket[]>([])

const [newMassage, setNewMassage] = useState<string>("")

const socket = useRef<WebSocket | null>(null)

const [disconnected, setDisconnected] = useState<string | null>(null)

const [isOpen, setIsopen] = useState(false)

const [posi, setPosi] = useState({x : 0, y : 0})

const time = useRef<number | null>(null)

const [selectId, setSelectId] = useState<number | null>(null)

const menuref = useRef<HTMLDivElement>(null)

const navigate = useNavigate()

const [userid, setUserid] = useState<getinfo[]>([]);

useEffect(() => {
    if (!auth?.access) return;

    socket.current = new WebSocket(
        `wss://massagebox.runflare.run/ws/chat/general/?token=${auth.access}`
    );
    console.log("LOCAL:", localStorage.getItem("access"));
    console.log("CONTEXT:", auth?.access);

    socket.current.onopen = () => {
        console.log("connected");
        setDisconnected(null);
    };


    socket.current.onmessage = (event) => {

    const data = JSON.parse(event.data);

    if(data.type == "chat_ID"){
        console.log("WS MESSAGE:", data);
        navigate(`/chat/${data.chat_id}`)
    }

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
                userid: data.username_id
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

    
      const send_ID_user = async (userid:number) =>{
        console.log("SENDING USER ID:", userid);
        socket.current?.send(
            JSON.stringify({
                type : "create-direct",
                ID_user : userid
            })
        )
    }


    useEffect(() => {
    
}, []);
     
return (
    <>
        <div className='back-chat'>
            <div className="header">
                <h1>massageBOX</h1>

            <section className="title-logout">

                <button onClick={() => auth?.rm_token()}>

                {auth?.isAuth && <span>خروج</span>}

                </button>

            </section>

            </div>

            {disconnected && (
                <span style={{ color: "red" }}>{disconnected}</span>
            )}

        <div className='massages'>

    <div className='massages'>
        {message.map((user) => (
            <span
                key={user.userid}
                    onClick={() => {
                    console.log("CLICKED");
                    send_ID_user(user.userid!);
                    }}
                
                style={{ cursor: "pointer" }}
            >
                {user.username}

            </span>
        ))}
    </div>

{message.map((messageText, index) => {
    const showUsername =
        index === 0 ||
        message[index - 1].username !== messageText.username;

    return (
        <section className="par-mass" key={messageText.id}>

            {showUsername && (
                <span className="username">
                    {messageText.username}
                </span>
            )}

            <p
                onContextMenu={(e) => contextMenu(e, messageText.id)}
                onPointerDown={(e) => pressFin(e, messageText.id)}
            >
                {messageText.message}
            </p>

        </section>
    );
})}
        

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