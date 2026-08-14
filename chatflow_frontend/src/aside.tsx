import {
    useState,
    createContext,
    useRef,
    useEffect,
} from "react";

import { Link } from "react-router-dom";

interface AsideContextType {
    openPopUp: boolean;
    setOpenPopUP: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AsideContext = createContext<AsideContextType | null>(null);

const Aside = ({ children }: { children: React.ReactNode }) => {

    const [openPopUp, setOpenPopUP] = useState(false);

    const aside = useRef<HTMLElement>(null);

    useEffect(() => {

        const handler = (e: MouseEvent | TouchEvent) => {

            if (
                aside.current &&
                !aside.current.contains(e.target as Node)
            ) {
                setOpenPopUP(false);
            }

        };

        document.addEventListener("mousedown", handler);
        document.addEventListener("touchstart", handler);

        return () => {
            document.removeEventListener("mousedown", handler);
            document.removeEventListener("touchstart", handler);
        };

    }, []);

    return (
        <AsideContext.Provider
            value={{
                openPopUp,
                setOpenPopUP,
            }}
        >

            <div>

                {openPopUp && (
                    
                    <aside ref={aside}>

                        <span>
                            <Link
                                style={{
                                    color: "white",
                                    textDecoration: "none",
                                }}
                                to="/"
                            >
                               باکس اصلی
                            </Link>
                        </span>

                        <span>
                            ساختن گروه (بزودی!)
                        </span>

                        <span>
                            <Link
                                style={{
                                    color: "white",
                                    textDecoration: "none",
                                }}
                                to="/about"
                            >
                                مسیج باکس & کاربران
                            </Link>
                        </span>

                        <span>
                            <Link
                                style={{
                                    color: "white",
                                    textDecoration: "none",
                                }}
                                to="/topics"
                            >
                               باکس تاپیک

                            </Link>
                        </span>

                    </aside>
                )}

                {children}

            </div>

        </AsideContext.Provider>
    );
};

export default Aside;
