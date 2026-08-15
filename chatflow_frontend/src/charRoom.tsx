import React, {
    useState,
    useEffect,
    useContext,
    useRef
} from "react";

import { authContext } from "./authprovider";
import { useParams, useNavigate } from "react-router-dom";
import "../src/charRoom.css";
import axios from "axios";
import imageCompression from "browser-image-compression";


interface Message {
    message: string;
    username: string;
    date: string;
    username_id: number;
    id: number;
    media_URL: string | null;
}


interface GetInfo {
    username: string;
    userid: number | null;
}


const ChatRoom: React.FC = () => {

    const auth = useContext(authContext);

    const navigate = useNavigate();

    const { roomSlug, topicSlug } = useParams<{
        roomSlug: string;
        topicSlug: string;
    }>();


    // =========================
    // STATE
    // =========================

    const [message, setMessages] = useState<Message[]>([]);

    const [newMassage, setNewMassage] = useState<string>("");

    const [error, setError] = useState<string | null>(null);

    const [disconnected, setDisconnected] =
        useState<string | null>(null);

    const [isOpen, setIsopen] = useState(false);

    const [posi, setPosi] = useState({
        x: 0,
        y: 0
    });

    const [selectId, setSelectId] =
        useState<number | null>(null);

    const [resFile, setResFile] =
        useState<File | null>(null);

    const [mediaUrl, setMediaUrl] =
        useState<string | null>(null);

    const [mediaId, setMediaId] =
        useState<number | null>(null);


    const socket =
        useRef<WebSocket | null>(null);

    const time =
        useRef<number | null>(null);

    const menuref =
        useRef<HTMLDivElement>(null);

    const messageRef =
        useRef<HTMLDivElement>(null);


    // =========================
    // WEBSOCKET
    // =========================

    useEffect(() => {

        if (!roomSlug || !topicSlug) {
            return;
        }


        const wsUrl =
            `wss://massagesbox.ir/ws/chat/${roomSlug}/${topicSlug}/`;


        console.log("CONNECTING:", wsUrl);


        socket.current = new WebSocket(wsUrl);


        socket.current.onopen = () => {

            console.log("WEBSOCKET CONNECTED");

            setDisconnected(null);
        };


        socket.current.onmessage = (event) => {

            const data = JSON.parse(event.data);

            console.log("RECEIVED:", data);


            // =========================
            // DIRECT CHAT ID
            // =========================

            if (data.type === "chat_ID") {

                navigate(`/chat/${data.chat_id}`);

                return;
            }


            // =========================
            // MESSAGE DELETED
            // =========================

            if (data.type === "message_deleted") {

                setMessages((prev) =>
                    prev.filter(
                        (msg) =>
                            msg.id !== data.mass_id
                    )
                );

                setIsopen(false);

                return;
            }


            // =========================
            // TOPIC MESSAGE
            // =========================

            if (data.type === "chat_topic_message") {

                const newMessage: Message = {

                    message: data.message,

                    username: data.username,

                    date: data.date,

                    username_id: data.username_id,

                    id: data.id,

                    media_URL: data.media_URL
                };


                setMessages((prev) => [
                    ...prev,
                    newMessage
                ]);

                return;
            }

        };


        socket.current.onclose = (event) => {

            console.log(
                "WS CLOSED:",
                event.code,
                event.reason
            );


            if (event.code === 1006) {

                setDisconnected(
                    "ارتباط WebSocket قطع شد"
                );
            }
        };


        socket.current.onerror = (event) => {

            console.log(
                "WS ERROR:",
                event
            );

            setError(
                "اتصال WebSocket قطع شد!"
            );
        };


        // CLEANUP

        return () => {

            console.log(
                "CLOSING WEBSOCKET"
            );

            socket.current?.close();

            socket.current = null;
        };


    }, [roomSlug, topicSlug, navigate]);


    // =========================
    // SEND MESSAGE
    // =========================

    const post_Massage = (
        event: React.FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();


        if (
            !newMassage.trim() &&
            !mediaUrl
        ) {
            return;
        }


        if (
            !socket.current ||
            socket.current.readyState !== WebSocket.OPEN
        ) {

            console.error(
                "WEBSOCKET IS NOT OPEN"
            );

            return;
        }


        socket.current.send(
            JSON.stringify({

                type: "message",

                message: newMassage.trim(),

                mediaURL: mediaUrl,

                mediaId: mediaId

            })
        );


        setNewMassage("");

        setMediaUrl(null);

        setMediaId(null);
    };


    // =========================
    // UPLOAD MEDIA
    // =========================

    const uploadMedia = async () => {

        if (!resFile) {

            alert(
                "ابتدا یک فایل انتخاب کنید"
            );

            return;
        }


        const compressionOptions = {

            maxSizeMB: 1,

            maxWidthOrHeight: 1920,

            useWebWorker: true
        };


        try {

            const compressedFile =
                await imageCompression(
                    resFile,
                    compressionOptions
                );


            const formData =
                new FormData();


            formData.append(
                "media",
                compressedFile
            );


            const response =
                await axios.post(
                    "https://massagesbox.ir/massage/Upload/",
                    formData,
                    {
                        withCredentials: true
                    }
                );

            console.log("OLD MESSAGES:", response.data);
            setMediaUrl(
                response.data.mediaUrl
            );


            setMediaId(
                response.data.mediaUrlid
            );


            setResFile(null);


        } catch (error) {

            console.log(
                "UPLOAD ERROR:",
                error
            );
        }
    };


    // =========================
    // OLD MESSAGES
    // =========================

    const getOldMessages = async () => {

        if (!roomSlug || !topicSlug) {
            return;
        }


        try {

            const response =
                await axios.get(
                    `https://massagesbox.ir/massage/${roomSlug}/${topicSlug}/`,
                    {
                        withCredentials: true
                    }
                );


            setMessages(
                response.data
            );


        } catch (error) {

            console.log(
                "GET OLD MESSAGES ERROR:",
                error
            );
        }
    };


    useEffect(() => {

        getOldMessages();

    }, [roomSlug, topicSlug]);


    // =========================
    // DELETE MESSAGE
    // =========================

    const delete_massage = (
        id_massage: number
    ) => {

        console.log(
            "DELETE ID:",
            id_massage
        );


        if (
            !socket.current ||
            socket.current.readyState !== WebSocket.OPEN
        ) {

            console.error(
                "WEBSOCKET IS NOT OPEN"
            );

            return;
        }


        socket.current.send(
            JSON.stringify({

                type: "delete_message",

                massageId: id_massage

            })
        );
    };


    // =========================
    // CONTEXT MENU
    // =========================

    const contextMenu = (
        e: React.MouseEvent,
        id: number
    ) => {

        e.preventDefault();

        setSelectId(id);

        setPosi({
            x: e.clientX,
            y: e.clientY
        });

        setIsopen(true);
    };


    // =========================
    // TOUCH LONG PRESS
    // =========================

    const pressFin = (
        e: React.PointerEvent,
        id: number
    ) => {

        if (e.pointerType !== "touch") {
            return;
        }


        time.current =
            window.setTimeout(() => {

                setSelectId(id);

                setPosi({
                    x: e.clientX,
                    y: e.clientY
                });

                setIsopen(true);

            }, 500);
    };


    const setTimeOut = () => {

        if (time.current) {

            clearTimeout(
                time.current
            );

            time.current = null;
        }
    };


    // =========================
    // CLOSE MENU
    // =========================

    const handler = (
        e: MouseEvent | TouchEvent
    ) => {

        const target =
            e.target as Node;


        if (
            menuref.current &&
            !menuref.current.contains(target)
        ) {

            setIsopen(false);
        }
    };


    useEffect(() => {

        document.addEventListener(
            "mousedown",
            handler
        );

        document.addEventListener(
            "touchstart",
            handler
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handler
            );

            document.removeEventListener(
                "touchstart",
                handler
            );
        };

    }, []);


    // =========================
    // COPY MESSAGE
    // =========================

    const copy_massage = (
        id: number
    ) => {

        const cp_mass =
            message.find(
                (msg) =>
                    msg.id === id
            );


        if (!cp_mass) {
            return;
        }


        navigator.clipboard.writeText(
            cp_mass.message
        );


        setIsopen(false);
    };


    // =========================
    // SEND USER ID
    // =========================

    const send_ID_user = (
        userid: number
    ) => {

        if (
            !socket.current ||
            socket.current.readyState !== WebSocket.OPEN
        ) {
            return;
        }


        socket.current.send(
            JSON.stringify({

                type: "create-direct",

                ID_user: userid

            })
        );
    };


    // =========================
    // AUTO SCROLL
    // =========================

    useEffect(() => {

        if (!messageRef.current) {
            return;
        }


        messageRef.current.scrollTo({

            top:
                messageRef.current.scrollHeight,

            behavior: "smooth"
        });

    }, [message]);


    // =========================
    // UI
    // =========================

    return (
        <>

            <div className="back-chat">


                {disconnected && (

                    <span
                        style={{
                            color: "red"
                        }}
                    >
                        {disconnected}
                    </span>

                )}


                {error && (

                    <span
                        style={{
                            color: "red"
                        }}
                    >
                        {error}
                    </span>

                )}


                <div
                    ref={messageRef}
                    className="massages"
                >


                    {message.map(
                        (messageText, index) => {

                            const showUsername =
                                index === 0 ||
                                message[
                                    index - 1
                                ].username !==
                                    messageText.username;


                            return (

                                <section

                                    key={
                                        messageText.id
                                    }

                                    className={
                                        messageText.username_id ===
                                        auth?.currentUser.username_id

                                            ? "current-par-mass"

                                            : "par-mass"
                                    }


                                    onContextMenu={
                                        (e) =>
                                            contextMenu(
                                                e,
                                                messageText.id
                                            )
                                    }


                                    onPointerDown={
                                        (e) =>
                                            pressFin(
                                                e,
                                                messageText.id
                                            )
                                    }


                                    onPointerUp={
                                        setTimeOut
                                    }


                                    onPointerCancel={
                                        setTimeOut
                                    }

                                >


                                    {showUsername && (

                                        <span

                                            className="username"

                                            style={{
                                                cursor: "pointer"
                                            }}


                                            onClick={() => {

                                                if (
                                                    messageText.username_id ===
                                                    auth?.currentUser.username_id
                                                ) {
                                                    return;
                                                }


                                                send_ID_user(
                                                    messageText.username_id
                                                );
                                            }}

                                        >

                                            {
                                                messageText.username
                                            }

                                        </span>

                                    )}


                                    {messageText.media_URL && (

                                        <img

                                            className="message-media"

                                            src={
                                                `https://massagesbox.ir${messageText.media_URL}`
                                            }

                                            alt="imageBOX"

                                        />

                                    )}


                                    <p>
                                        {
                                            messageText.message
                                        }
                                    </p>


                                </section>
                            );
                        }
                    )}


                    {isOpen && (

                        <section

                            ref={menuref}

                            className="menudetails"

                            style={{

                                position: "absolute",

                                top: posi.y,

                                left: posi.x,

                                width: "fit-content"
                            }}

                        >

                            <button

                                className="copy"

                                onClick={() => {

                                    if (
                                        selectId !== null
                                    ) {
                                        copy_massage(
                                            selectId
                                        );
                                    }

                                }}

                            >
                                کپی
                            </button>


                            <button

                                className="delete"

                                onClick={() => {

                                    if (
                                        selectId !== null
                                    ) {
                                        delete_massage(
                                            selectId
                                        );
                                    }

                                }}

                            >
                                حذف
                            </button>

                        </section>
                    )}

                </div>


                <div className="massage-text">

                    <form
                        onSubmit={post_Massage}
                    >

                        <input

                            type="text"

                            value={newMassage}

                            onChange={(e) =>
                                setNewMassage(
                                    e.target.value
                                )
                            }

                            placeholder="چیزی بنویسید"

                        />


                        <div className="upload-media">

                            <input

                                type="file"

                                name="file"

                                id="file"

                                onChange={(e) => {

                                    if (
                                        e.target.files?.length
                                    ) {

                                        setResFile(
                                            e.target.files[0]
                                        );
                                    }

                                }}

                            />


                            <button

                                type="button"

                                className="media-btn"

                                onClick={
                                    uploadMedia
                                }

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
};


export default ChatRoom;