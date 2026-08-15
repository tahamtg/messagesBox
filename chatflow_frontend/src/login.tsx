import { useState, useEffect } from "react";
import axios, {type AxiosResponse, AxiosError, isAxiosError} from "axios";
import {AuthProvider, authContext} from "./authprovider";
import { useContext } from "react";
import { Usecontext } from "./context";
import { replace, useNavigate, Link } from "react-router-dom"
import './login.css'
import Logo from '../public/d862b856-2462-456f-ada2-8f3f8304c7c8.png'

const Login = ()=>{
    const {form, setForm} = useContext(Usecontext)!
    const auth = useContext(authContext)
    const [error, setError] = useState<string | null>(null)
    const [mass, setMass] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    

    const toLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
        setLoading(true);

        const res = await axios.post(
            "https://massagesbox.ir/massage/login/",
            {
                username: form.username,
                password: form.password
            },
            {
                withCredentials: true,
            }
        );

        console.log("LOGIN RESPONSE RECEIVED:", res.status);
        console.log("LOGIN DATA:", res.data);

        console.log("BEFORE AUTH");

        auth?.setIsAuth(true);

        console.log("AFTER AUTH");

        console.log("BEFORE NAVIGATE");

        navigate("/", { replace: true });

        console.log("AFTER NAVIGATE");

        console.log(res.data);

    } catch (e: any) {
        console.log("LOGIN CATCH:", e);
        console.log("LOGIN ERROR RESPONSE:", e.response?.data);
        console.log("LOGIN ERROR STATUS:", e.response?.status);

        auth?.setIsAuth(false);
        setError("نام کاربری یا رمز عبور اشتباه است");
        setMass(null);
    }finally {
            setLoading(false);
        }
    };

    return(
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
            {error ? (
                <span>{error}</span>
            ) : mass ? (
                <span>{mass}</span>
            ) : null}
        </section>

        <section className="form">
            <form onSubmit={toLogin}>
                <input
                    type="text"
                    placeholder="نام کاربری"
                    value={form.username}
                    onChange={(e)=>setForm({...form,username:e.target.value})}
                />

                <input
                    type="password"
                    placeholder="رمز عبور"
                    value={form.password}
                    onChange={(e)=>setForm({...form,password:e.target.value})}
                />

                <button
                    type="submit"
                    className="button-form"
                    disabled={loading}
                >
                    {loading ? "در حال بررسی..." : "ورود"}
                </button>

                <Link className="linkto" to="../sign">
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