import { Outlet } from "react-router-dom";
import Header from "./header";
import './layout.css'
import Aside from "./aside";

const Layout = () => {
    
    return ( 
        <>
        <Aside>
        <Header/>
        <main className="main-layout">
            <Outlet />
        </main>
        </Aside>
        </>
     );

}
 
export default Layout;