import { useState } from 'react';
import './editprofile.css';
import { useParams } from 'react-router-dom';

const EditProfile = () => {
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [accountStatus, setAccountStatus] = useState('active');
    const [onlineStatus, setOnlineStatus] = useState('balanced');
    const { id } = useParams<{ id: string }>();
    console.log(id);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        console.log({
            username,
            bio,
            accountStatus,
            onlineStatus,
        });
    };

    return (
        <div className="edit-profile-page" dir="rtl">

            <div className="edit-profile-container">

                <div className="edit-profile-header">

                    <span className="edit-profile-badge">
                        تنظیمات حساب
                    </span>

                    <h1>ویرایش پروفایل</h1>

                    <p>
                        اطلاعات شخصی و وضعیت حساب کاربری خود را مدیریت کنید.
                    </p>

                </div>

                <form className="edit-profile-card" onSubmit={handleSubmit}>

                    <div className="edit-profile-section">

                        <div className="edit-profile-section-title">
                            <span className="edit-profile-icon">✎</span>

                            <div>
                                <h2>اطلاعات شخصی</h2>
                                <p>اطلاعات پروفایل خود را ویرایش کنید.</p>
                            </div>
                        </div>

                        <div className="edit-profile-field">

                            <label htmlFor="edit-username">
                                نام کاربری
                            </label>

                            <input
                                id="edit-username"
                                type="text"
                                placeholder="نام کاربری جدید"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />

                        </div>

                        <div className="edit-profile-field">

                            <label htmlFor="edit-bio">
                                بیوگرافی
                            </label>

                            <textarea
                                id="edit-bio"
                                placeholder="کمی درباره خودت بنویس..."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={4}
                                maxLength={250}
                            />

                            <span className="edit-profile-hint">
                                حداکثر ۲۵۰ کاراکتر
                            </span>

                        </div>

                    </div>

                    <div className="edit-profile-divider"></div>

                    <div className="edit-profile-section">

                        <div className="edit-profile-section-title">
                            <span className="edit-profile-icon">⚙</span>

                            <div>
                                <h2>تنظیمات حساب</h2>
                                <p>وضعیت نمایش و دسترسی حساب خود را انتخاب کنید.</p>
                            </div>
                        </div>

                        <div className="edit-profile-field">

                            <label htmlFor="account-status">
                                وضعیت حساب کاربری
                            </label>

                            <select
                                id="account-status"
                                value={accountStatus}
                                onChange={(e) => setAccountStatus(e.target.value)}
                            >
                                <option value="active">فعال (Active)</option>
                                <option value="not-active">غیرفعال (Not-active)</option>
                                <option value="balanced">متعادل (Balanced)</option>
                            </select>

                            <span className="edit-profile-hint">
                                وضعیت موردنظر خود را انتخاب کنید.
                            </span>

                        </div>

                    </div>

                    <div className="edit-profile-divider"></div>

                    <div className="edit-profile-section">

                        <div className="edit-profile-section-title">
                            <span className="edit-profile-icon">◷</span>

                            <div>
                                <h2>زمان آنلاینی</h2>
                                <p>وضعیت آنلاین بودن خود را مشخص کنید.</p>
                            </div>
                        </div>

                        <div className="edit-profile-radio-group">

                            <label className={`edit-profile-radio ${onlineStatus === 'active' ? 'selected' : ''}`}>

                                <input
                                    type="radio"
                                    name="online-status"
                                    value="active"
                                    checked={onlineStatus === 'active'}
                                    onChange={(e) => setOnlineStatus(e.target.value)}
                                />

                                <span className="edit-profile-radio-dot"></span>

                                <span className="edit-profile-radio-text">
                                    <strong>فعال</strong>
                                    <small>وضعیت آنلاین نمایش داده شود.</small>
                                </span>

                                <span className="edit-profile-status-dot online"></span>

                            </label>

                            <label className={`edit-profile-radio ${onlineStatus === 'not-active' ? 'selected' : ''}`}>

                                <input
                                    type="radio"
                                    name="online-status"
                                    value="not-active"
                                    checked={onlineStatus === 'not-active'}
                                    onChange={(e) => setOnlineStatus(e.target.value)}
                                />

                                <span className="edit-profile-radio-dot"></span>

                                <span className="edit-profile-radio-text">
                                    <strong>غیرفعال</strong>
                                    <small>وضعیت آنلاین نمایش داده نشود.</small>
                                </span>

                                <span className="edit-profile-status-dot offline"></span>

                            </label>

                            <label className={`edit-profile-radio ${onlineStatus === 'balanced' ? 'selected' : ''}`}>

                                <input
                                    type="radio"
                                    name="online-status"
                                    value="balanced"
                                    checked={onlineStatus === 'balanced'}
                                    onChange={(e) => setOnlineStatus(e.target.value)}
                                />

                                <span className="edit-profile-radio-dot"></span>

                                <span className="edit-profile-radio-text">
                                    <strong>متعادل</strong>
                                    <small>وضعیت آنلاین مطابق فعالیت شما باشد.</small>
                                </span>

                                <span className="edit-profile-status-dot balanced"></span>

                            </label>

                        </div>

                    </div>

                    <div className="edit-profile-footer">

                        <span className="edit-profile-footer-hint">
                            تغییرات پس از ذخیره اعمال خواهند شد.
                        </span>

                        <button
                            type="submit"
                            className="edit-profile-save"
                        >
                            ذخیره تغییرات
                            <span>←</span>
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default EditProfile;