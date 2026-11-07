import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import avatar from "../public/images.png";
import add from "../public/icons8-plus-24.png";
import "./directs.css";

interface directProp {
    chat_key: string;
    username: string;
    username_key: string;
    avatar: string;
}

interface foundUserProp {
    username: string;
    name: string | null;
    bio: string;
    username_key: string;
    avatar: string | null;
}

const BASE_URL = "https://massagesbox.ir";

const Directs = () => {
    const [getDirect, setGetDirect] = useState<directProp[]>([]);
    const [isAdd, setIsAdd] = useState(false);
    const [usersKey, setUsersKey] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [foundUser, setFoundUser] = useState<foundUserProp | null>(null);

    const socket = useRef<WebSocket | null>(null);
    const navigate = useNavigate();

    const getINFO = async () => {
        try {
            const res = await axios.get<directProp[]>(
                `${BASE_URL}/massage/get_directs/`,
                { withCredentials: true }
            );

            setGetDirect(res.data);
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        getINFO();

        const ws = new WebSocket("wss://massagesbox.ir/ws/direct/");
        socket.current = ws;

        ws.onmessage = (e) => {
            const data = JSON.parse(e.data);

            if (data.type === "user_found") {
                setLoading(false);
                setError("");

                setFoundUser({
                    username: data.username,
                    name: data.name,
                    bio: data.bio,
                    username_key: data.username_key,
                    avatar: data.avatar,
                });
            }

            if (data.type === "chat_KEY") {
                setLoading(false);
                getINFO();
                navigate(`/chat/${data.chat_key}`);
            }

            if (data.type === "error") {
                setLoading(false);
                setFoundUser(null);
                setError(data.message);
            }
        };

        ws.onerror = () => {
            setLoading(false);
            setError("خطا در اتصال به سرور");
        };

        ws.onclose = () => {
            setLoading(false);
            setError((prev) => prev || "اتصال بسته شد");
        };

        return () => {
            ws.onclose = null;
            ws.close();
            socket.current = null;
        };
    }, [navigate]);

    const handleSearch = () => {
        const key = usersKey.trim();

        if (!key || loading) return;

        setError("");
        setFoundUser(null);

        if (socket.current?.readyState !== WebSocket.OPEN) {
            setError("اتصال برقرار نیست");
            return;
        }

        setLoading(true);

        socket.current.send(JSON.stringify({
            type: "search_user",
            KEY_user: key,
        }));
    };

    const create_direct = (user: string) => {
        if (loading) return;

        if (socket.current?.readyState !== WebSocket.OPEN) {
            setError("اتصال برقرار نیست");
            return;
        }

        setError("");
        setLoading(true);

        socket.current.send(JSON.stringify({
            type: "create_direct",
            KEY_user: user,
        }));
    };

    const avatarSrc = (url: string | null) => {
        if (!url) return avatar;

        return url.startsWith("http") ? url : `${BASE_URL}${url}`;
    };

    return (
        <div className="directs_container">

            <div className="add_direct">
                <button onClick={() => {
                    setIsAdd(!isAdd);
                    setError("");
                    setFoundUser(null);
                }}>
                    <img src={add} alt="add" />
                    <span>اضافه کردن چت یا مخاطب با پرایمکی!</span>
                </button>

                {isAdd && (
                    <div className="add_direct_form">
                        <input
                            value={usersKey}
                            onChange={(e) => setUsersKey(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            placeholder="کد کاربر رو وارد کن"
                        />

                        <button onClick={handleSearch} disabled={loading}>
                            {loading ? <span className="spinner" /> : "پیدا کردن کاربر"}
                        </button>

                        {error && <p className="direct_error">{error}</p>}

                        {foundUser && (
                            <div
                                onClick={() => create_direct(foundUser.username_key)}
                                className="found_user"
                            >
                                <img
                                    src={avatarSrc(foundUser.avatar)}
                                    alt={foundUser.username}
                                />

                                <div className="found_user_info">
                                    <strong>{foundUser.name || foundUser.username}</strong>
                                    <span>@{foundUser.username}</span>
                                    {foundUser.bio && <p>{foundUser.bio}</p>}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="directs_list">
                {getDirect.length > 0 ? (
                    getDirect.map((direct) => (
                        <div
                            className="direct_item"
                            key={direct.chat_key}
                            onClick={() => navigate(`/chat/${direct.chat_key}`)}
                        >
                            <img
                                src={avatarSrc(direct.avatar)}
                                alt={direct.username}
                            />

                            <div className="direct_info">
                                <strong>{direct.username}</strong>
                                <span>@{direct.username}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty_directs">
                        هنوز هیچ گفتگویی نداری!
                    </div>
                )}
            </div>

        </div>
    );
};

export default Directs;