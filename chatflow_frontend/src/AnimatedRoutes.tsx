import { Routes, Route, useLocation } from "react-router-dom";
import "./page-transition.css";

import Profile from "./profile";
import EditProfile from "./editprofile";
import About from "./about";
import Login from "./login";
import Sign from "./sign";
import Topics from "./topics";

const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <div key={location.pathname} className="page-transition">

            <Routes location={location}>
                <Route
                    path="/sign"
                    element={<Sign />}
                />
                <Route
                    path="/login"
                    element={<Login />}
                />
                <Route
                    path="/profile"
                    element={<Profile />}
                />
                <Route
                    path="/about"
                    element={<About />}
                />
                <Route
                    path="/topics"
                    element={<Topics />}
                />
            </Routes>
        
        </div>
    );
};

export default AnimatedRoutes;