import { Routes, Route } from 'react-router-dom'
import Sign from './sign'
import {Usecontext} from './context'
import { AuthProvider } from './authprovider'
import ProtectedRoute from './ProtectedRoute'
import React, { useState } from 'react'
import Login from './login'
import User_Direct from './Direct'
import Layout from './Layout'
import ChatRoom from './charRoom'
import About from './about'

interface api_sign {
  username: string,
  password: string,
  userid: number | null
}

const App: React.FC = () => {

  const [form, setForm] = useState<api_sign>({
    username: "",
    password: "",
    userid : null
  })

  return (
   <Usecontext.Provider value={{form, setForm}}>
    <AuthProvider>

      <Routes>
         
      <Route element={<Layout/>}>

        <Route path="/" element={
         <ProtectedRoute>
          <ChatRoom />
         </ProtectedRoute>
          } />
        
        <Route
        path="about"
        element={<About />}
        />
        <Route path='/chat/:chat_id' element={<User_Direct />} />
        <Route path='/:roomName' element={<ChatRoom />} />

      </Route>

        

        <Route
          path="login"
          element={<Login />}
        />

        
      </Routes>
    
    </AuthProvider>

    <Route
          path="sign"
          element={<Sign />}
        />
        
    </Usecontext.Provider>
  )
}

export default App;
