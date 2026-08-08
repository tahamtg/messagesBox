import React, { useState, useEffect ,useContext, useRef} from 'react'
import {authContext} from './authprovider';
import { useParams } from 'react-router-dom';
import '../src/charRoom.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


interface get_data_from_websooket{
    message : string,
    username : string,
    publish_date : string,
    username_id: number,
    payam: string,
    id: number,
    curent_user: string,
    curent_user_id: number,
    media: string | null,
}

interface getinfo{
    username: string,
    userid: number | null
}

const ChatRoom : React.FC = () =>{


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

const messageRef = useRef<HTMLDivElement>(null)

const {roomName} = useParams()

const [resFile, setResFile] = useState<File | null>(null)

const [mediaUrl, setMediaUrl] = useState<string | null>(null)

const [mediaId, setMediaId] = useState<string | null>(null)


const room = roomName ?? 'general'


//===========For WebSocket===========//

useEffect(() => {

    socket.current = new WebSocket(
        `wss://massagesbox.ir/ws/chat/${room}/`
    );

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
                    curent_user: data.curent_user,
                    curent_user_id: data.curent_user_id,
                    message: data.message,
                    username: data.username,
                    id: data.id,
                    publish_date: data.date,
                    username_id: data.username_id,
                    payam: data.payam,
                    media: data.media,
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
  setError("اتصال قطع شد!");
};

    return () => {
        socket.current?.close();
    };
    
}, [room]);


//===========For Post Messages & Media===========//


const post_Massage = async (event: React.FormEvent<HTMLFormElement>) => {
    
    event.preventDefault();

    if (!socket.current || socket.current.readyState !== WebSocket.OPEN){
        console.error("connection to websocket is failed!")
        return
    }
    socket.current?.send(
        JSON.stringify({
            type: "chat_message",
            message: newMassage,
            mediaURL : mediaUrl,
            mediaId : mediaId,
        })
    );

    setNewMassage("");
};

//===========For Upload Media===========//

const uploadMedia = async () => {

    if (!resFile) {
        alert("ابتدا یک فایل انتخاب کنید");
        return;
    }

    const formData = new FormData();
    formData.append("media", resFile);

    const response = await axios.post(
        "https://massagesbox.ir/massage/Upload/",
        formData,
        {
            withCredentials: true,
        }
    );

    setMediaUrl(response.data.mediaUrl)
    setMediaId(response.data.mediaUrlid)
    setResFile(null);
};


//===========For Messages===========//

const getOldMessages = async () => {
    try {
        const response = await axios.get(
            `https://massagesbox.ir/massage/${room}/`,
            {
                withCredentials: true
            }
        );

        setMessages(response.data);

    } catch (error) {
        console.log("GET OLD MESSAGES ERROR:", error);
    }
};

useEffect(() => {
    getOldMessages();
}, [room]);

//===========For menu===========//

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
    
    }, 500)

};

const setTimeOut = ()=>{

    if (time.current){
        clearTimeout(time.current)
        time.current = null;
    }

};


//===========For delete_massage===========//

const delete_massage= (id_massage: number)=>{
    console.log("DELETE ID:", id_massage);
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

//===========For copy_massage===========//

    const copy_massage = (id:number) =>{
        console.log("start func copy")
        const cp_mass = message.find((msg)=> msg.id == id)
        if (!cp_mass){return}
        navigator.clipboard.writeText(cp_mass.message)
        console.log("COPIED")
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

//===========For To Scroll Div Messages===========//

useEffect(()=>{

    if(!messageRef.current) return;
 
    messageRef.current?.scrollTo({
    top: messageRef.current.scrollHeight,
    behavior: "smooth"
});

}, [message]);


//===========For Final Fragment===========//

return (
    <>
        <div className='back-chat'>

            {disconnected && (
                <span style={{ color: "red" }}>{disconnected}</span>
            )}

        <div ref={messageRef} className='massages'>

        {message.map((messageText, index) => {
            const showUsername =
            index === 0 ||
            message[index - 1].username !== messageText.username;

    return (
        
        <section className={
            
            messageText.username_id === auth?.currentUser.username_id ? "current-par-mass" : "par-mass"

        } 
        
        key={messageText.id} onContextMenu={(e)=> contextMenu(e, messageText.id)} 
        onPointerDown={(e)=> pressFin(e, messageText.id)}
        onPointerUp={setTimeOut} 
        onPointerCancel={setTimeOut}   >
            {showUsername && (
                <span   
                    onClick={() => {
                    console.log(auth?.currentUser);
                    console.log(messageText);
                    if(messageText.username_id === auth?.currentUser.username_id) return;
                    console.log("CLICKED");
                    send_ID_user(messageText.username_id!);
                    }}
                
                style={{ cursor: "pointer" }} className="username">
                    {messageText.username}
                </span>
            )}

            {messageText.media && (
                <img
                className="message-media"
                src={`https://massagesbox.ir/massage/${messageText.media}`}
                alt="imageBOX"
            />
            )}

            <p>{messageText.message}</p>
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
            
          
            <button onClick={()=> {if (selectId) copy_massage(selectId);

            
            }} className="copy">
                کپی
            </button>

            <button onClick={() =>  {if (selectId) delete_massage(selectId);

            }} className="delete">
                حذف
            </button>

        </section>
            )}

           
        </div>

<div className="massage-text">
    <form onSubmit={post_Massage}>

        <input
            type="text"
            value={newMassage}
            onChange={(e) => setNewMassage(e.target.value)}
            placeholder="چیزی بنویسید"
        />

        <div className="upload-media">

            <input
                type="file"
                name="file"
                id="file"
                onChange={(e) => {
                    if (e.target.files?.length) {
                        setResFile(e.target.files[0]);
                    }
                }}
            />

            <button
                type="button"
                className="media-btn"
                onClick={uploadMedia}
            >
                ارسال مدیا
            </button>

            <button
                type="submit"
                className="send-btn"
            >
                ارسال
            </button>

        </div>

    </form>
</div>

        </div>

    </>
);
}

export default ChatRoom;