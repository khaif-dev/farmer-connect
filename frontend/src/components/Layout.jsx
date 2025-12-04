import React from 'react'
import Nav from './Navbar'
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className='bg-gray-50 dark:bg-gray-900 min-h-screen'>
      <Nav />
      <main className="w-full min-h-screen">
        <div className="container mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
