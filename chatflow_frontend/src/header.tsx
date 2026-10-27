import { useContext } from "react";
import { authContext } from "./authprovider";
import { AsideContext } from "./aside";

import "./header.css";

const Header = () => {

    const auth = useContext(authContext);

    const { openPopUp, setOpenPopUP } =
        useContext(AsideContext)!;



    const togglePopup = () => {
        setOpenPopUP(false);
    };

    return (
        <div className="header">

            <h1>messagesBOX</h1>

            <div>
                <button
                    className="forpopup"
                    onClick={togglePopup}
                >
                    {openPopUp ? (
                        <span onClick={()=> setOpenPopUP(false)}>بستن</span>
                    ) : (
                        <span onClick={()=> setOpenPopUP(true)}>دسترسی</span>
                    )}
                </button>
            </div>

        </div>
    );
};

export default Header;

