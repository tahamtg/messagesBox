import { Outlet } from "react-router-dom";
import Header from "./header";
import './layout.css'

const Layout = () => {
    
    return ( 
        <>
        <Header/>
        <main className="main-layout">
            <Outlet />
        </main>
        </>
     );

}
 
export default Layout;