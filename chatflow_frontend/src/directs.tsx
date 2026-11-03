import axios from "axios";
import React, {
    useState,
    useEffect,
    useContext,
    useRef
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { string } from "yup";
import avatar from '../public/images.png'
import add from '../public/icons8-plus-24.png'

interface directProp {
    chat_key: string,
    username: string,
    username_key: string,
    avatar: string,
}

import './directs.css'

const Directs = () => {
    const [getDirect, setGetDirect] = useState<directProp[]>([])
    const [isAdd, setIsAdd] = useState(false)
    const [usersKey, setUsersKey] = useState("")
    const [error, setError] = useState("")
    const socket = useRef<WebSocket | null>(null)
    const navigate = useNavigate()

    const getINFO = async () => {
        try {
            const res = await axios.get<directProp[]>(
                "https://massagesbox.ir/massage/get_directs/",
                { withCredentials: true }
            )
            setGetDirect(res.data)
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        getINFO()

        // آدرس سوکت خودت رو بذار
        const ws = new WebSocket("wss://massagesbox.ir/ws/YOUR_PATH/")
        socket.current = ws

        ws.onmessage = (e) => {
            const data = JSON.parse(e.data)
            if (data.type === "chat_KEY") {
                navigate(`/chat/${data.chat_key}`)
            } else if (data.type === "error") {
                setError(data.message)
            }
        }

        return () => ws.close()
    }, [])

    const handleCreate = () => {
        if (!usersKey.trim()) return
        if (socket.current?.readyState !== WebSocket.OPEN) {
            setError("اتصال برقرار نیست")
            return
        }
        socket.current.send(JSON.stringify({
            type: "create_direct",   // با چیزی که توی receive چک می‌کنی یکی باشه
            KEY_user: usersKey.trim()
        }))
    }

    return (
        <>
            <div className="add_direct">
                <button onClick={() => setIsAdd(!isAdd)}>
                    <img src={add} alt="add" />
                    <span>اضافه کردن چت یا مخاطب با پرایمکی!</span>
                </button>

                {isAdd && (
                    <div>
                        <input
                            value={usersKey}
                            onChange={(e) => setUsersKey(e.target.value)}
                            placeholder="کد کاربر رو وارد کن"
                        />
                        <button onClick={handleCreate}>ساخت چت</button>
                        {error && <p>{error}</p>}
                    </div>
                )}
            </div>

            {/* لیست directها مثل قبل */}
        </>
    )
}
 
export default Directs;