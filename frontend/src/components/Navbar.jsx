import React from 'react'
import { Sprout, LogIn, LogOut } from 'lucide-react'
import { Link } from "react-router-dom";
import * as Avatar from '@radix-ui/react-avatar';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Nav = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();  

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm flex justify-between items-center px-8 py-4 z-10">
      {/* Logo */}
      <div className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors">
        <Sprout className="h-7 w-7" />
        <span>Farmer Connect</span>
      </div>

      {/* Nav Links */}
      <div className="flex items-center gap-8 text-gray-700 dark:text-gray-300 font-medium">
        {/* NavLink with smooth green underline */}
        <Link
          to="/"
          className="relative after:content-[''] after:absolute after:w-0 after:h-[2px] after:bg-green-700 dark:after:bg-green-400 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full hover:text-green-700 dark:hover:text-green-400"
        >
          Home
        </Link>

        {isAuthenticated && (
          <>
            <Link
              to="/dashboard"
              className="relative after:content-[''] after:absolute after:w-0 after:h-[2px] after:bg-green-700 dark:after:bg-green-400 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full hover:text-green-700 dark:hover:text-green-400"
            >
              Dashboard
            </Link>

            <Link
              to="/market-place"
              className="relative after:content-[''] after:absolute after:w-0 after:h-[2px] after:bg-green-700 dark:after:bg-green-400 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full hover:text-green-700 dark:hover:text-green-400"
            >
              Market Place
            </Link>
          </>
        )}

        {!isAuthenticated ? (
          /* Log In Button */
          <Link
            to="/login"
            className="flex items-center gap-2 bg-green-700 dark:bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-800 dark:hover:bg-green-700 transition-all"
          >
            <LogIn className="h-5 w-5" />
            Log In
          </Link>
        ) : (
          /* Avatar Dropdown */
          <div className="flex items-center gap-2">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Avatar.Root className="h-10 w-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer">
                  <Avatar.Image
                    className="h-full w-full object-cover"
                    src="https://github.com/shadcn.png"
                    alt="Profile"
                  />
                  <Avatar.Fallback className="flex items-center justify-center h-full w-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm font-semibold">
                    {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar.Fallback>
                </Avatar.Root>
              </DropdownMenu.Trigger>

              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="min-w-[180px] bg-white dark:bg-gray-800 rounded-md shadow-md border dark:border-gray-700 p-2"
              >
                <DropdownMenu.Label className="px-2 py-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  My Profile
                </DropdownMenu.Label>
                <DropdownMenu.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
                <DropdownMenu.Item
                  onClick={() => window.location.href = '/profile'}
                  className="px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer text-gray-700 dark:text-gray-300"
                >
                  Profile
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => window.location.href = '/messages'}
                  className="px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer text-gray-700 dark:text-gray-300"
                >
                  Messages
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => {
                    logout();
                    // redirect to home page after logout
                    window.location.href = '/';
                  }}
                  className="px-2 py-1 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenu.Item>
                <DropdownMenu.Item 
                  className="px-2 py-1 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md cursor-pointer">
                  Delete Account
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        )}
        <button
          onClick={toggleTheme}
          className="text-sm px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? <Sun /> : <Moon />}
        </button>
      </div>
    </nav>
  );
};

export default Nav;
