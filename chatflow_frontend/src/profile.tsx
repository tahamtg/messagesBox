import avatar from '../public/images.png';
import './Profile.css';
import { useContext } from 'react';
import { authContext } from './authprovider';


const Profile = () => {

const auth = useContext(authContext)

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

                            <div className="avatar-overlay">
                                تغییر
                            </div>

                        </div>


                        <div className="profile-user-info">

                            <span className="profile-user-label">
                                نام کاربری
                            </span>

                            <h2>
                                username
                            </h2>

                            <span className="profile-status">
                                حساب کاربری فعال
                            </span>

                        </div>

                    </div>


                    {/* Profile Actions */}
                    <div className="profile-actions">

                        <button className="profile-action">
                            <span className="action-icon">
                                ✎
                            </span>

                            <span>
                                ویرایش پروفایل
                            </span>
                        </button>


                        <button className="profile-action">
                            <span className="action-icon">
                                ⚙
                            </span>

                            <span>
                                تنظیمات حساب
                            </span>
                        </button>

                    </div>

                </div>


                {/* Account Section */}
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