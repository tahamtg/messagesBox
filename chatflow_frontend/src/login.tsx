import { useState, useContext } from "react";
import axios from "axios";
import { authContext } from "./authprovider";
import { Usecontext } from "./context";
import { useNavigate, useLocation, Link } from "react-router-dom"
import './login.css'
import Logo from '../public/d862b856-2462-456f-ada2-8f3f8304c7c8.png'

const Login = () => {
    const { form, setForm } = useContext(Usecontext)!
    const auth = useContext(authContext)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    const toLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (loading) return

        const username = form.username.trim()

        if (!username || !form.password) {
            setError("نام کاربری و رمز عبور را وارد کنید")
            return
        }

        try {
            setLoading(true);
            setError(null)

            await axios.post(
                "https://massagesbox.ir/massage/login/",
                {
                    username: username,
                    password: form.password
                },
                {
                    withCredentials: true,
                }
            );

            auth?.setIsAuth(true);

            setForm({ ...form, username: username, password: "" })

            const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname

            navigate(from || "/", { replace: true });

        } catch (e) {
            auth?.setIsAuth(false);

            if (axios.isAxiosError(e) && e.response?.status === 401) {
                setError("نام کاربری یا رمز عبور اشتباه است")
            } else if (axios.isAxiosError(e) && e.response) {
                setError("مشکلی در سرور پیش آمد، کمی بعد دوباره تلاش کن")
            } else {
                setError("ارتباط با سرور برقرار نشد")
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="total-login">

                <div className="radialback"></div>

                <div className="login">

                    <div className="logo-container">
                        <img src={Logo} className="logo" alt="Messages Box" />
                    </div>

                    <h1 className="login-title">ورود</h1>

                    <p className="login-subtitle">
                        به حساب کاربری خود وارد شوید.
                    </p>

                    <section className="massage">
                        {error && <span>{error}</span>}
                    </section>

                    <section className="form">
                        <form onSubmit={toLogin}>

                            <input
                                type="text"
                                placeholder="نام کاربری"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                            />

                            <input
                                type="password"
                                placeholder="رمز عبور"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                            />

                            <button
                                type="submit"
                                className="button-form"
                                disabled={loading}
                            >
                                {loading ? "در حال بررسی..." : "ورود"}
                            </button>

                            <Link className="linkto" to="/sign">
                                اکانت ندارید؟ ثبت نام کنید!
                            </Link>

                        </form>
                    </section>

                </div>

            </div>
        </>
    )
}

export default Login
