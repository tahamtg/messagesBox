import { useContext } from "react";

import { authContext } from "./authprovider";
import { AsideContext } from "./aside";

import "./header.css";

const Header = () => {

    const auth = useContext(authContext);

    const { openPopUp, setOpenPopUP } =
        useContext(AsideContext)!;

    const logout = () => {
        auth?.logOut();
    };

    const togglePopup = () => {
        setOpenPopUP(!openPopUp);
    };

    return (
        <div className="header">

            <h1>messagesBOX</h1>

            <section className="title-logout">
                {auth?.isAuth && (
                    <button onClick={logout}>
                        <span>خروج</span>
                    </button>
                )}
            </section>

            <div>
                <button
                    className="forpopup"
                    onClick={togglePopup}
                >
                    {openPopUp ? (
                        <span>بستن</span>
                    ) : (
                        <span>دسترسی</span>
                    )}
                </button>
            </div>

        </div>
    );
};

export default Header;

