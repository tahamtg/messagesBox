import { useState, useEffect, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from "axios";
import * as yup from "yup";
import imageCompression from 'browser-image-compression';
import { Usecontext } from './context';
import './sign.css'
import Logo from '../public/d862b856-2462-456f-ada2-8f3f8304c7c8.png'
import avatar from '../public/images.png'

const schema = yup.object({
    username: yup
        .string()
        .required("نام کاربری الزامی میباشد")
        .min(3, "نام کاربری باید حداقل ۳ کاراکتر باشد")
        .max(255, "نام کاربری خیلی طولانی است")
        .matches(
            /^[a-zA-Z0-9_]+$/,
            "نام کاربری فقط شامل حروف، عدد و _ باشد"
        ),

    password: yup
        .string()
        .required("رمز عبور الزامی میباشد")
        .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
});

const translate = (text: string) => {
    if (text.includes("already exists")) return "این نام کاربری قبلاً گرفته شده"
    if (text.includes("too common")) return "این رمز عبور خیلی رایج است"
    if (text.includes("entirely numeric")) return "رمز عبور نباید فقط عدد باشد"
    if (text.includes("too similar")) return "رمز عبور خیلی شبیه نام کاربری است"
    if (text.includes("too short")) return "رمز عبور خیلی کوتاه است"
    return text
}

const readErrors = (e: unknown): string[] => {
    if (axios.isAxiosError(e) && e.response) {
        const data = e.response.data

        if (data && typeof data === "object") {
            const messages = Object.values(data).flat().map((item) => translate(String(item)))

            if (messages.length) return messages
        }

        return ["ثبت نام انجام نشد، دوباره تلاش کن"]
    }

    return ["ارتباط با سرور برقرار نشد"]
}

const Sign = () => {

    const { form, setForm } = useContext(Usecontext)!
    const [error, setError] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [profile, setProfile] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        return () => {
            if (profile) URL.revokeObjectURL(profile)
        }
    }, [profile])

    const add_user = async (event: React.FormEvent<HTMLFormElement>) => {

        event.preventDefault()

        if (loading) return

        try {
            await schema.validate(form, { abortEarly: false })
        } catch (e) {
            if (e instanceof yup.ValidationError) {
                setError(e.errors)
            } else {
                setError(["مشکلی پیش آمد، دوباره تلاش کن"])
            }
            return
        }

        setLoading(true)
        setError([])

        try {
            const file = new FormData()

            file.append("username", form.username)
            file.append("password", form.password)
            file.append("bio", form.bio)

            if (form.profile) {
                let avatarFile: File = form.profile

                try {
                    avatarFile = await imageCompression(form.profile, {
                        maxSizeMB: 1,
                        maxWidthOrHeight: 1024,
                        useWebWorker: true
                    })
                } catch {
                    avatarFile = form.profile
                }

                file.append("avatar", avatarFile)
            }

            await axios.post(
                "https://massagesbox.ir/massage/sign-up/",
                file,
                {
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            setForm({ ...form, password: "", bio: "", profile: null })

            navigate("/login", { replace: true });

        } catch (e) {
            setError(readErrors(e))
        } finally {
            setLoading(false)
        }
    }

    return (
        <>

            <div className="total-sign">

                <div className="radialback"></div>

                <div className='sign'>

                    <div className="logo-container">
                        <img src={Logo} className="logo" alt="massagesbox" />
                    </div>

                    <h1 className='signup-title'>ثبت نام</h1>

                    <div className="info-box">
                        <p>شرایط ثبت نام:</p>
                        <ul>
                            <li>نام کاربری حداقل ۳ کاراکتر باشد.</li>
                            <li>نام کاربری فقط شامل حروف، عدد و _ باشد.</li>
                            <li>رمز عبور حداقل ۸ کاراکتر باشد.</li>
                            <li>نام کاربری تکراری قابل استفاده نیست.</li>
                        </ul>
                    </div>

                    <section className='massage'>
                        {error.map((err, index) => (
                            <div key={index}>
                                <span>{err}</span>
                            </div>
                        ))}
                    </section>

                    <section className='form'>
                        <form onSubmit={add_user}>

                            <label htmlFor="profile" className="avatar">
                                <img src={profile || avatar} alt="avatar" />
                                {!profile && <h2 className='titleprofile'>انتخاب پروفایل</h2>}
                            </label>

                            <input
                                type="file"
                                name="file"
                                id="profile"
                                accept="image/*"
                                hidden
                                onChange={(e) => {
                                    const img = e.target.files?.[0]

                                    if (img) {
                                        setForm({ ...form, profile: img })
                                        setProfile(URL.createObjectURL(img))
                                    }
                                }}
                            />

                            <input
                                type="text"
                                placeholder='نام کاربری'
                                value={form.username}
                                onChange={(e) => { setForm({ ...form, username: e.target.value }) }}
                            />

                            <input
                                type="text"
                                placeholder='درباره خود چیزی بنویسید!'
                                value={form.bio}
                                onChange={(e) => { setForm({ ...form, bio: e.target.value }) }}
                            />

                            <input
                                type="password"
                                placeholder='رمز عبور'
                                value={form.password}
                                onChange={(e) => { setForm({ ...form, password: e.target.value }) }}
                            />

                            <button className='button-form' type="submit" disabled={loading}>
                                {loading ? (<span>در حال بررسی...</span>) : <span>ثبت نام</span>}
                            </button>
                        </form>

                        <Link className='linkto' to='/login'>اکانت دارید؟ وارد بشید!</Link>
                    </section>

                </div>
            </div>

        </>
    )
}

export default Sign
