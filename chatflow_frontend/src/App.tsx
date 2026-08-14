import { Routes, Route } from "react-router-dom";
import React, { useState } from "react";

import Sign from "./sign";
import Login from "./login";
import { Usecontext } from "./context";
import AuthLayout from './AuthLayout '
import ProtectedRoute from "./ProtectedRoute";

import Layout from "./Layout";
import ChatRoom from "./charRoom";
import User_Direct from "./Direct";
import About from "./about";
import Index from ".";
import Topics from "./topics";
import ChooseTopics from "./choosetopics";

interface api_sign {
    username: string;
    password: string;
    userid: number | null;
}

const App: React.FC = () => {

    const [form, setForm] = useState<api_sign>({
        username: "",
        password: "",
        userid: null,
    });

    return (
        <Usecontext.Provider value={{ form, setForm }}>

            <Routes>

                <Route
                    path="/sign"
                    element={<Sign />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route element={<AuthLayout />}>

                    <Route element={<Layout />}>

                        <Route
                            path="/"
                            element={
                               <ProtectedRoute>
                                    <Index />
                               </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/about"
                            element={<About />}
                        />

                        <Route
                            path="/chat/:chat_id"
                            element={<User_Direct />}
                        />

                        <Route
                            path="/topics/:roomSlug/:topicSlug"
                            element={<ChatRoom />}
                        />

                        <Route
                            path="/topics"
                            element={<Topics />}
                        />

                        <Route
                            path="/topics/:slug"
                            element={<ChooseTopics />}
                        />

                    </Route>

                </Route>

            </Routes>

        </Usecontext.Provider>
    );
};

export default App;