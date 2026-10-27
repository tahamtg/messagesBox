import { useContext, useState } from 'react';
import './editprofile.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Usecontext } from './context';

interface Update_User {
    username: string;
    bio: string;
    account_status_online: boolean;
}

const EditProfile = () => {
    const bio_form = useContext(Usecontext);

    const [info_for_update, setInfo_for_update] = useState<Update_User>({
        username: "",
        bio: bio_form?.form.bio || "",
        account_status_online: true,
    });

    const { id } = useParams<{ id: string }>();

    console.log(id);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const res = await axios.patch(
                "https://massagesbox.ir/massage/Update_Info",
                info_for_update,
                {
                    withCredentials: true,
                }
            );

            console.log(res.data);
        } catch (error) {
            if(axios.isAxiosError(error)){
                console.log(error.response?.status)
                console.log(error.response?.data)
                console.log(error.message)
            }
        }
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
                                value={info_for_update.username}
                                onChange={(e) =>
                                    setInfo_for_update((prev) => ({
                                        ...prev,
                                        username: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="edit-profile-field">
                            <label htmlFor="edit-bio">
                                بیوگرافی
                            </label>

                            <textarea
                                id="edit-bio"
                                placeholder="کمی درباره خودت بنویس..."
                                value={info_for_update.bio}
                                onChange={(e) =>
                                    setInfo_for_update((prev) => ({
                                        ...prev,
                                        bio: e.target.value,
                                    }))
                                }
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
                            <span className="edit-profile-icon">◷</span>

                            <div>
                                <h2>زمان آنلاینی</h2>
                                <p>وضعیت آنلاین بودن خود را مشخص کنید.</p>
                            </div>
                        </div>

                        <div className="edit-profile-radio-group">
                            <label
                                className={`edit-profile-radio ${
                                    info_for_update.account_status_online
                                        ? 'selected'
                                        : ''
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="online-status"
                                    value="active"
                                    checked={info_for_update.account_status_online === true}
                                    onChange={() =>
                                        setInfo_for_update((prev) => ({
                                            ...prev,
                                            account_status_online: true,
                                        }))
                                    }
                                />

                                <span className="edit-profile-radio-dot"></span>

                                <span className="edit-profile-radio-text">
                                    <strong>فعال</strong>
                                    <small>وضعیت آنلاین نمایش داده شود.</small>
                                </span>

                                <span className="edit-profile-status-dot online"></span>
                            </label>

                            <label
                                className={`edit-profile-radio ${
                                    !info_for_update.account_status_online
                                        ? 'selected'
                                        : ''
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="online-status"
                                    value="not-active"
                                    checked={info_for_update.account_status_online === false}
                                    onChange={() =>
                                        setInfo_for_update((prev) => ({
                                            ...prev,
                                            account_status_online: false,
                                        }))
                                    }
                                />

                                <span className="edit-profile-radio-dot"></span>

                                <span className="edit-profile-radio-text">
                                    <strong>غیرفعال</strong>
                                    <small>وضعیت آنلاین نمایش داده نشود.</small>
                                </span>

                                <span className="edit-profile-status-dot offline"></span>
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
