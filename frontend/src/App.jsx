import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import Transaction from './pages/Transaction'
import Budget from './pages/Budget'
import Report from './pages/Report'
import Footer from './components/Footer'
import SignUp from './pages/Signup'
import Signin from './pages/Signin'
import { useEffect, useState } from 'react'
import VerifyEmail from './pages/VerifyEmail'
import ResetPassword from './pages/ResetPassword'
import useUserStore from './store/useUserStore'
import Loading from './components/Loading'
import { Toaster } from 'react-hot-toast'


const RedirectAuthentticatedUser = ({ children }) => {
  const { isAuthenticated, userData, isLoading } = useUserStore();

  if (isLoading) {
    return <div className='min-h-screen flex justify-center items-center bg-gray-50'>
      <Loading />
    </div>
  }

  if (isAuthenticated && userData.isVerified) {
    return <Navigate to='/dashboard' replace />
  }

  return children;
}

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, userData, isLoading } = useUserStore();

  if (isLoading) {
    return <div className='min-h-screen flex justify-center items-center bg-gray-50'>
      <Loading />
    </div>
  }

  if (!isAuthenticated) {
    return <Navigate to='/signin' replace />
  }
  if(!userData.isVerified) {
    return <Navigate to='/verify-email' replace />
  }
  return children;
}


function App() {
  const { checkAuth, isLoading, isAuthenticated } = useUserStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth])

  if (isLoading) {
    return <div className='min-h-screen flex justify-center items-center bg-gray-50'>
      <Loading />
    </div>
  }


  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <BrowserRouter>
        <Navbar />
        <Toaster />
        <main className="flex-1">
          <Routes>
            <Route path='/' element={<Landing />} />
            <Route
              path='/signin'
              element={
                <RedirectAuthentticatedUser>
                  <Signin />
                </RedirectAuthentticatedUser>
              }
            />
            <Route
              path='/signup'
              element={
                <RedirectAuthentticatedUser>
                  <SignUp />
                </RedirectAuthentticatedUser>
              }
            />
            <Route
              path='/dashboard'
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path='/transactions'
              element={
                <ProtectedRoute>
                  <Transaction />
                </ProtectedRoute>
              }
            />
            <Route
              path='/budgets'
              element={
                <ProtectedRoute>
                  <Budget />
                </ProtectedRoute>
              }
            />
            <Route
              path='/reports'
              element={
                <ProtectedRoute>
                  <Report />
                </ProtectedRoute>
              }
            />
            <Route path='/verify-email' element={<VerifyEmail />} />
            <Route path='/reset-password' element={<ResetPassword />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </div>
  )
}


export default App
