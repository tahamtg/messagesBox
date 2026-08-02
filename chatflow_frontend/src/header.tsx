import { useState, useContext, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {authContext} from './authprovider';
import './header.css'
import { Link } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import box1 from '../public/box1.png'
import box2 from '../public/box2.png'

const Header = () => {

    const navigate = useNavigate()
    const location = useLocation()
    const auth = useContext(authContext)
    const [openPopUp, setOpenPopUP] = useState(false)
    const aside = useRef<HTMLDivElement>(null)
    const mobileres = useMediaQuery({
        maxWidth: 768
    })

    const handler = (e: MouseEvent | TouchEvent)=>{
        if (aside.current && !aside.current.contains(e.target as Node)){
            setOpenPopUP(false);
        }
    }

    useEffect(()=>{

        document.addEventListener("mousedown", handler);
        document.addEventListener("touchstart", handler);

        return ()=>{
            document.removeEventListener("mousedown", handler);
            document.removeEventListener("touchstart", handler);
        };

    },[])
    

    return (  
        <div>
            <div className="header">

                <h1>messagesBOX</h1>

            <section className="title-logout">

                <button onClick={() => auth?.logOut()}>
                
                    {auth?.isAuth && <span>خروج</span>}

                </button>

            </section>

                <button className="forpopup" onClick={()=> (setOpenPopUP(!openPopUp))}>
                    
                    { openPopUp ? <span>بستن</span> : <span>دسترسی</span> }

                </button>

            </div>

        <div ref={aside}>

            {openPopUp &&
                <aside>
                    <span>ساختن گروه (بزودی!)</span>
                    <span><Link style={{color: "white", textDecoration: "none"}} to={'/about'}>مسیج باکس & کاربران</Link></span>
                </aside>
            }

        </div>

        <div className="tabs">

            <div className={location.pathname == '/' ? 'active' : ""}><button
             onClick={() => {
             navigate("/", { replace: true });
            }}>{mobileres ? <img width={'100px'} height={'70px'} src={box1} alt="box1" /> : <span>صفحه اصلی</span>}</button>
             </div>

            <div className={location.pathname == '/room2' ? 'active' : ""}><button 
            onClick={() => {
            navigate("/room2", { replace: true });
            }}> {mobileres ? <img width={'100px'} height={'70px'} src={box2} alt="box2" /> : <span>جعبه دوم</span>}
            </button>
            </div>

        </div>
    </div>
    );
}
 
export default Header;