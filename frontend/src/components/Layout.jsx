import React from 'react'
import Nav from './Navbar'
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className='bg-gray-50 dark:bg-gray-900 min-h-screen'>
      <Nav />
      <main className="flex justify-center items-center w-full min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
