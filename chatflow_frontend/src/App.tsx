import { Routes, Route } from 'react-router-dom'
import Massage from './massage'
import Sign from './sign'
import {Usecontext} from './context'
import { AuthProvider } from './authprovider'
import ProtectedRoute from './ProtectedRoute'
import React, { useState } from 'react'

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
   
    <AuthProvider>
    <Usecontext.Provider value={{form, setForm}}>
      <Routes>
         
        <Route path="/" element={
          <ProtectedRoute>
          <Massage />
          </ProtectedRoute>
          } />
        
        <Route
          path="sign/"
          element={<Sign />}
        />
      </Routes>
    </Usecontext.Provider>
    </AuthProvider>
  )
}

export default App
