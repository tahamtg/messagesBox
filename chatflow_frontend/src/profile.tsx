import avatar from '../public/images.png';
import './profile.css';
import { useContext, useState, useEffect } from 'react';
import { authContext } from './authprovider';
import copy from "../public/icons8-copy-48.png";
import tick from "../public/icons8-check-48.png";
import axios from 'axios';
import { Link } from 'react-router-dom';

const Profile = () => {

    const [getKey, setGetKey] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [newPhoto, setNewPhoto] = useState<File | null>(null)

    const auth = useContext(authContext);

    const get_primary_key = async () => {
        try {
            const res = await axios.get(
                "https://massagesbox.ir/massage/get_my_key/",
                {
                    withCredentials: true,
                }
            );

            console.log("Response data:", res.data);
            console.log("Key:", res.data.key);

            setGetKey(res.data.key);

        } catch (e) {
            console.log("Get key failed:", e);
        }
    };

    useEffect(() => {
        get_primary_key();
    }, []);


    const Update_Photo = async (photo: File) => {
        const file = new FormData();

        file.append("media", photo);

        try {
            const res = await axios.patch(
                "https://massagesbox.ir/massage/update_photo/",
                file,
                {
                    withCredentials: true,
                }
            );

            auth?.setCurrentuser({
                ...auth.currentUser,
                avatar: res.data.mediaUrl,
            });

        } catch (e) {
            console.log("Photo update failed:", e);
        }
    };



    const copyKey = async () => {

        if (!getKey) return;

        await navigator.clipboard.writeText(getKey);

        setIsCopied(true);

        setTimeout(() => {
            setIsCopied(false);
        }, 2000);
    };


    return (
        <div className="profile-page">

            <div className="profile-container">

                <div className="profile-header">

                    <span className="profile-badge">
                        ناحیه کاربری
                    </span>

                    <h1>پروفایل</h1>

                    <p>
                        اطلاعات حساب کاربری و تنظیمات خود را مدیریت کنید.
                    </p>

                </div>


                <div className="profile-card">

                    <div className="profile-user">

                        <div className="profile-avatar-wrapper">

                            <img
                                src={auth?.currentUser.avatar || avatar}
                                alt="profile"
                                className="profile-avatar"
                            />

                                <label className="avatar-overlay">
                                     تغییر
                                <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={(e) => {
                                            const photo = e.target.files?.[0];

                                            if (photo) {
                                                Update_Photo(photo);
                                            }

                                            e.target.value = "";
                                        }}
                                    />
                            </label>


                        </div>



                        <div className="profile-user-info">

                            <span className="profile-user-label">
                                نام کاربری
                            </span>

                            <h2>
                                {auth?.currentUser.username}
                            </h2>

                            <p>{auth?.currentUser.bio}</p>

                            <div className="profile-key">

                                <span className="profile-key-label">
                                    کد یکتا
                                </span>

                                <div className="profile-key-box">

                                    <span className="profile-key-value">
                                        {getKey}
                                    </span>

                                    <button
                                        className="profile-key-copy"
                                        onClick={copyKey}
                                        disabled={!getKey}
                                    >
                                        <img
                                            src={isCopied ? tick : copy}
                                            alt={isCopied ? "copied" : "copy"}
                                        />
                                    </button>

                                </div>

                            </div>


                            <span className="profile-status">
                                حساب کاربری فعال
                            </span>

                        </div>

                    </div>


                    <div className="profile-actions">

                        <Link className="editpROFLINK" to="/profile/editbox">
                          <button className="profile-action">
                            <span className="action-icon">
                                ✎
                            </span>

                            <span>
                                ویرایش پروفایل و تنظیمات حساب کاربری
                            </span>
                        </button>
                        </Link>

                    </div>

                </div>

                <div className="profile-section">

                    <h2>
                        اطلاعات حساب
                    </h2>

                    <div className="profile-info-list">

                        <div className="profile-info-item">

                            <span className="info-label">
                                نام کاربری
                            </span>

                            <span className="info-value">
                                {auth?.currentUser.username}
                            </span>

                        </div>


                        <div className="profile-info-item">

                            <span className="info-label">
                                وضعیت حساب
                            </span>

                            <span className="info-value active">
                                فعال
                            </span>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Profile;