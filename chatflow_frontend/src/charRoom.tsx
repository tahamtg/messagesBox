import React, {
    useState,
    useEffect,
    useContext,
    useRef
} from "react";

import { authContext } from "./authprovider";
import { useParams, useNavigate } from "react-router-dom";
import "./charRoom.css";
import axios from "axios";
import imageCompression from "browser-image-compression";
import avatar from '../public/images.png'

interface Message {
    message: string;
    username: string | null;
    date?: string;
    username_id: number | null;
    username_key: string | null;
    id: number;
    media_URL: string | null,
    avatar_user: string | null,
}

type Status = "connecting" | "open" | "reconnecting" | "failed";

const BASE_URL = "https://massagesbox.ir";
const WS_URL = "wss://massagesbox.ir";
const PING_INTERVAL = 25000;
const PONG_TIMEOUT = 10000;
const MAX_RECONNECT = 10;

const toUrl = (path: string | null) => {
    if (!path) return null;

    return path.startsWith("http") ? path : `${BASE_URL}${path}`;
};

const mergeMessages = (history: Message[], current: Message[]) => {
    const lastId = history.length ? history[history.length - 1].id : 0;

    return [
        ...history,
        ...current.filter((msg) => msg.id > lastId)
    ];
};

const ChatRoom: React.FC = () => {

    const auth = useContext(authContext);

    const { chat_key, roomSlug, topicSlug } = useParams<{
        chat_key: string;
        roomSlug: string;
        topicSlug: string;
    }>();

    const navigate = useNavigate();
    const navigateRef = useRef(navigate);

    const [message, setMessages] = useState<Message[]>([]);
    const [newMassage, setNewMassage] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<Status>("connecting");
    const [sending, setSending] = useState(false);
    const [isOpen, setIsopen] = useState(false);
    const [posi, setPosi] = useState({ x: 0, y: 0 });
    const [selectId, setSelectId] = useState<number | null>(null);
    const [resFile, setResFile] = useState<File | null>(null);

    const socket = useRef<WebSocket | null>(null);
    const time = useRef<number | null>(null);
    const menuref = useRef<HTMLDivElement>(null);
    const messageRef = useRef<HTMLDivElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        navigateRef.current = navigate;
    }, [navigate]);

    useEffect(() => {

        if (!roomSlug || !topicSlug) {
            return;
        }

        const wsUrl = `${WS_URL}/ws/chat/${roomSlug}/${topicSlug}/`;

        let ws: WebSocket | null = null;
        let closedByUs = false;
        let loadedOnce = false;
        let attempts = 0;
        let reconnectTimer: number | undefined;
        let pingTimer: number | undefined;
        let pongTimer: number | undefined;

        setMessages([]);
        setStatus("connecting");
        setError(null);

        const loadHistory = async () => {
            try {
                const response = await axios.get<Message[]>(
                    `${BASE_URL}/massage/${encodeURIComponent(roomSlug)}/${encodeURIComponent(topicSlug)}/`,
                    {
                        withCredentials: true,
                        silent: loadedOnce
                    }
                );

                loadedOnce = true;

                if (!closedByUs) {
                    setMessages((prev) => mergeMessages(response.data, prev));
                }

            } catch (e) {
                if (!closedByUs) {
                    setError("دریافت پیام‌های قبلی انجام نشد");
                }
            }
        };

        const stopHeartbeat = () => {
            window.clearInterval(pingTimer);
            window.clearTimeout(pongTimer);
        };

        const detach = (target: WebSocket) => {
            target.onopen = null;
            target.onmessage = null;
            target.onclose = null;
            target.onerror = null;
            target.close();
        };

        const scheduleReconnect = () => {
            if (closedByUs) return;

            if (attempts >= MAX_RECONNECT) {
                setStatus("failed");
                return;
            }

            attempts += 1;

            setStatus("reconnecting");

            const delay = Math.min(1000 * 2 ** attempts, 30000);

            reconnectTimer = window.setTimeout(connect, delay);
        };

        const startHeartbeat = (current: WebSocket) => {
            stopHeartbeat();

            pingTimer = window.setInterval(() => {
                if (current.readyState !== WebSocket.OPEN) return;

                current.send(JSON.stringify({ type: "ping" }));

                window.clearTimeout(pongTimer);

                pongTimer = window.setTimeout(() => {
                    stopHeartbeat();
                    detach(current);
                    scheduleReconnect();
                }, PONG_TIMEOUT);

            }, PING_INTERVAL);
        };

        const connect = () => {
            const current = new WebSocket(wsUrl);

            ws = current;
            socket.current = current;

            current.onopen = () => {
                attempts = 0;

                setStatus("open");
                setError(null);

                startHeartbeat(current);
                loadHistory();
            };

            current.onmessage = (event) => {

                let data;

                try {
                    data = JSON.parse(event.data);

                } catch {
                    return;
                }

                if (data.type === "pong") {
                    window.clearTimeout(pongTimer);
                    return;
                }

                if (data.type === "chat_KEY") {
                    navigateRef.current(`/chat/${data.chat_key}`);
                    return;
                }

                if (data.type === "error") {
                    setError(data.message);
                    return;
                }

                if (data.type === "message_deleted") {
                    setMessages((prev) =>
                        prev.filter((msg) => msg.id !== data.mass_id)
                    );

                    setIsopen(false);

                    return;
                }

                if (data.type === "chat_topic_message") {

                    const newMessage: Message = {
                        message: data.message,
                        username: data.username,
                        date: data.date,
                        username_id: data.username_id,
                        username_key: data.username_key,
                        id: data.id,
                        avatar_user: data.avatar_user,
                        media_URL: data.media_URL,
                    };

                    setMessages((prev) =>
                        prev.some((msg) => msg.id === newMessage.id)
                            ? prev
                            : [...prev, newMessage]
                    );
                }
            };

            current.onclose = () => {
                stopHeartbeat();
                scheduleReconnect();
            };

            current.onerror = () => {
                current.close();
            };
        };

        const revive = () => {
            if (closedByUs) return;

            if (
                ws &&
                (ws.readyState === WebSocket.OPEN ||
                    ws.readyState === WebSocket.CONNECTING)
            ) {
                return;
            }

            window.clearTimeout(reconnectTimer);

            attempts = 0;

            setStatus("reconnecting");

            connect();
        };

        const onVisible = () => {
            if (document.visibilityState === "visible") {
                revive();
            }
        };

        window.addEventListener("online", revive);
        document.addEventListener("visibilitychange", onVisible);

        connect();

        return () => {
            closedByUs = true;

            window.clearTimeout(reconnectTimer);

            stopHeartbeat();

            window.removeEventListener("online", revive);
            document.removeEventListener("visibilitychange", onVisible);

            if (ws) {
                detach(ws);
            }

            socket.current = null;
        };

    }, [roomSlug, topicSlug]);

    const post_Massage = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();

        if (sending) {
            return;
        }

        const text = newMassage.trim();

        if (!text && !resFile) {
            return;
        }

        if (
            !socket.current ||
            socket.current.readyState !== WebSocket.OPEN
        ) {
            setError("اتصال برقرار نیست، کمی صبر کن");
            return;
        }

        setSending(true);
        setError(null);

        let finalMediaId: number | null = null;

        try {

            if (resFile) {

                if (!resFile.type.startsWith("image/")) {
                    setError("فقط تصویر قابل ارسال است");
                    return;
                }

                const compressedFile = await imageCompression(
                    resFile,
                    {
                        maxSizeMB: 1,
                        maxWidthOrHeight: 1920,
                        useWebWorker: true
                    }
                );

                const formData = new FormData();

                formData.append("media", compressedFile);

                const response = await axios.post(
                    `${BASE_URL}/massage/Upload/`,
                    formData,
                    {
                        withCredentials: true
                    }
                );

                finalMediaId = response.data.mediaUrlid;
            }

            const current = socket.current;

            if (!current || current.readyState !== WebSocket.OPEN) {
                setError("اتصال قطع شد، دوباره ارسال کن");
                return;
            }

            current.send(
                JSON.stringify({
                    type: "message",
                    message: text,
                    mediaId: finalMediaId
                })
            );

            setNewMassage("");
            setResFile(null);

            if (fileRef.current) {
                fileRef.current.value = "";
            }

        } catch (e) {
            setError("ارسال پیام انجام نشد");

        } finally {
            setSending(false);
        }
    };

    const delete_massage = (
        id_massage: number
    ) => {

        setIsopen(false);

        if (
            !socket.current ||
            socket.current.readyState !== WebSocket.OPEN
        ) {
            setError("اتصال برقرار نیست");
            return;
        }

        socket.current.send(
            JSON.stringify({
                type: "delete_message",
                massageId: id_massage
            })
        );
    };

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

    const pressFin = (
        e: React.PointerEvent,
        id: number
    ) => {

        if (e.pointerType !== "touch") {
            return;
        }

        const x = e.clientX;
        const y = e.clientY;

        time.current = window.setTimeout(() => {

            setSelectId(id);

            setPosi({ x: x, y: y });

            setIsopen(true);

        }, 500);
    };

    const setTimeOut = () => {

        if (time.current) {

            clearTimeout(time.current);

            time.current = null;
        }
    };

    useEffect(() => {

        const handler = (e: MouseEvent | TouchEvent) => {

            const target = e.target as Node;

            if (
                menuref.current &&
                !menuref.current.contains(target)
            ) {
                setIsopen(false);
            }
        };

        document.addEventListener("mousedown", handler);
        document.addEventListener("touchstart", handler);

        return () => {

            document.removeEventListener("mousedown", handler);
            document.removeEventListener("touchstart", handler);

            if (time.current) {
                clearTimeout(time.current);
            }
        };

    }, []);

    const copy_massage = async (
        id: number
    ) => {

        const cp_mass = message.find(
            (msg) => msg.id === id
        );

        setIsopen(false);

        if (!cp_mass) {
            return;
        }

        try {
            await navigator.clipboard.writeText(cp_mass.message);

        } catch (e) {
            setError("کپی انجام نشد");
        }
    };

    const send_KEY_user = (
        userKey: string | null
    ) => {

        if (
            !userKey ||
            !socket.current ||
            socket.current.readyState !== WebSocket.OPEN
        ) {
            return;
        }

        socket.current.send(
            JSON.stringify({
                type: "create_direct",
                KEY_user: userKey
            })
        );
    };

    useEffect(() => {

        if (!messageRef.current) {
            return;
        }

        messageRef.current.scrollTo({
            top: messageRef.current.scrollHeight,
            behavior: "smooth"
        });

    }, [message]);

    if (!roomSlug || !topicSlug) {
        return (
            <div className="back-chat">
                <span>
                    {chat_key
                        ? "چت مستقیم هنوز فعال نشده"
                        : "گفتگویی انتخاب نشده"}
                </span>
            </div>
        );
    }

    const selectedMessage = message.find(
        (msg) => msg.id === selectId
    );

    const isMine =
        !!selectedMessage &&
        selectedMessage.username_id === auth?.currentUser.username_id;

    return (
        <>

            <div className="back-chat">

                {status === "reconnecting" && (
                    <span style={{ color: "red" }}>
                        ارتباط قطع شد، در حال اتصال مجدد...
                    </span>
                )}

                {status === "failed" && (
                    <span style={{ color: "red" }}>
                        اتصال برقرار نشد، صفحه را دوباره باز کن
                    </span>
                )}

                {error && (
                    <span style={{ color: "red" }}>
                        {error}
                    </span>
                )}

                <div
                    ref={messageRef}
                    className="massages"
                >

                    {message.map((messageText, index) => {

                        const showUsername =
                            index === 0 ||
                            message[index - 1].username !== messageText.username;

                        const mediaSrc = toUrl(messageText.media_URL);

                        return (

                            <section

                                key={messageText.id}

                                className={
                                    messageText.username_id ===
                                        auth?.currentUser.username_id
                                        ? "current-par-mass"
                                        : "par-mass"
                                }

                                onContextMenu={(e) =>
                                    contextMenu(e, messageText.id)
                                }

                                onPointerDown={(e) =>
                                    pressFin(e, messageText.id)
                                }

                                onPointerUp={setTimeOut}

                                onPointerCancel={setTimeOut}

                                onPointerLeave={setTimeOut}

                            >

                                {showUsername && (

                                    <div className="user-info">

                                        <img
                                            className="user-avatar"
                                            src={toUrl(messageText.avatar_user) || avatar}
                                            alt={messageText.username ?? ""}
                                        />

                                        <span
                                            className="username"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => {

                                                if (
                                                    messageText.username_id ===
                                                    auth?.currentUser.username_id
                                                ) {
                                                    return;
                                                }

                                                send_KEY_user(messageText.username_key);
                                            }}
                                        >
                                            {messageText.username}
                                        </span>

                                    </div>

                                )}

                                {mediaSrc && (

                                    <img
                                        className="message-media"
                                        src={mediaSrc}
                                        alt="imageBOX"
                                    />

                                )}

                                <p>
                                    {messageText.message}
                                </p>

                            </section>
                        );
                    })}

                    {isOpen && (

                        <section

                            ref={menuref}

                            className="menudetails"

                            style={{
                                position: "fixed",
                                top: posi.y,
                                left: posi.x,
                                width: "fit-content"
                            }}

                        >

                            <button

                                className="copy"

                                onClick={() => {

                                    if (selectId !== null) {
                                        copy_massage(selectId);
                                    }

                                }}

                            >
                                کپی
                            </button>

                            {isMine && (

                                <button

                                    className="delete"

                                    onClick={() => {

                                        if (selectId !== null) {
                                            delete_massage(selectId);
                                        }

                                    }}

                                >
                                    حذف
                                </button>

                            )}

                        </section>
                    )}

                </div>

                <div className="massage-text">

                    <form onSubmit={post_Massage}>

                        <input

                            type="text"

                            value={newMassage}

                            maxLength={4000}

                            onChange={(e) =>
                                setNewMassage(e.target.value)
                            }

                            placeholder="چیزی بنویسید"

                        />

                        <div className="upload-media">

                            <input
                                ref={fileRef}
                                type="file"
                                name="file"
                                id="file"
                                accept="image/*"
                                style={{
                                    display: "block",
                                    visibility: "visible",
                                    opacity: 1,
                                    width: "250px",
                                    height: "40px"
                                }}
                                onChange={(e) => {
                                    setResFile(e.target.files?.[0] ?? null);
                                }}
                            />

                            <button

                                type="submit"

                                className="send-btn"

                                disabled={sending}

                            >
                                {sending ? "در حال ارسال..." : "ارسال"}
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </>
    );
};

export default ChatRoom;
