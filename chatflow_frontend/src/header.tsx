import { useContext } from "react";
import { AsideContext } from "./aside";

import "./header.css";

const Header = () => {


    const { openPopUp, setOpenPopUP } =
        useContext(AsideContext)!;



    const togglePopup = () => {
        setOpenPopUP(!openPopUp);
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

