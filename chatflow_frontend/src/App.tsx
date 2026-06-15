import { Routes, Route } from 'react-router-dom'
import Massage from './massage'
import Sign from './sign'
import {Usecontext} from './context'
import { AuthProvider } from './authprovider'
import ProtectedRoute from './ProtectedRoute'
import React, { useState } from 'react'
import User from './user'

import Login from './login'

interface api_sign {
  username: string
  password: string
}

const App: React.FC = () => {

  const [form, setForm] = useState<api_sign>({
    username: "",
    password: ""
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
        
          <Route path=':userID' element={<User />} />

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
