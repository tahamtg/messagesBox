import { Routes, Route } from 'react-router-dom'
import Massage from './massage'
import Sign from './sign'
import {Usecontext} from './context'
import { AuthProvider } from './authprovider'
import ProtectedRoute from './ProtectedRoute'
import React, { useState } from 'react'
import Login from './login'
import User_Direct from './Direct'

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
         
        <Route path="/" element={
          <ProtectedRoute>
          <Massage />
          </ProtectedRoute>
          } />
        
          <Route path='/chat/:chat_id' element={<User_Direct />} />

        <Route
          path="sign"
          element={<Sign />}
        />
          <Route
          path="login"
          element={<Login />}
        />
      </Routes>
    
    </AuthProvider>
    </Usecontext.Provider>
  )
}

export default App
