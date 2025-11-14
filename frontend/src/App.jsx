import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import SignUp from './pages/signup';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Onboarding from './pages/onboarding';
import Dashboard from './pages/dashboard';
import Marketplace from './pages/marketplace';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
// import ResetPassword from './pages/ResetPassword';
// import Footer from './components/Footer';
// import Nav from './components/nav';
import Layout from './components/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            {/* <Nav /> */}
            <main className="w-full flex-grow mx-auto py-10">
              <Routes>
                <Route path="/" element={<Layout/>}>
                  <Route index element={<Home/>}/>
                  <Route path="/signup" element={<SignUp/>}/>
                  <Route path="/login" element={<Login/>}/>
                  <Route path="/reset-password" element={<ResetPassword/>}/>
                  <Route path="/onboarding" element={<Onboarding/>}/>
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
                  <Route path="/market-place" element={<ProtectedRoute><Marketplace/></ProtectedRoute>}/>
                  <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
                  <Route path="/messages" element={<ProtectedRoute><Messages/></ProtectedRoute>}/>
                </Route>
              </Routes>
            </main>
            {/* <Footer /> */}
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App