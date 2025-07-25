import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Menu,
  X,
  Home,
  CreditCard,
  PieChart,
  BarChart3,
  LogOut,
  User,
} from 'lucide-react'

import { useState } from 'react'
import useUserStore from '../store/useUserStore';

const Navbar = () => {

  const location = useLocation();
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const { isAuthenticated, userData, logout } = useUserStore();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/transactions', label: 'Transactions', icon: CreditCard },
    { path: '/budgets', label: 'Budgets', icon: PieChart },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActivePath = (path) => location.pathname === path;

  return (
    <>
      <nav className='fixed top-0 left-0 z-50 flex justify-between items-center p-4 md:pl-9 md:pr-12 py-4 w-full bg-white border-b border-b-gray-200'>

        <div className='flex items-center space-x-8'>
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/logo.svg"
              alt="Finance Buddy Logo"
              className="w-8 h-8 group-hover:scale-110 transition-transform duration-200"
            />
            <span className="font-bold text-xl text-gray-900 group-hover:text-indigo-600 transition-colors">
              Finance Buddy
            </span>
          </Link>
        </div>

        {isAuthenticated && (
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActivePath(item.path)
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}


        <div className='flex items-center gap-x-3 sm:gap-x-4'>
          {isAuthenticated ? (
            <div className="hidden md:block relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-sm font-medium">
                  {userData?.name || userData?.email || 'User'}
                </span>
              </button>


              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-auto bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {userData?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {userData?.email}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-3">
              <Link
                to="/signin"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                Get Started
              </Link>
            </div>
          )}

          <button
            onClick={toggleMenu}
            className='md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200' aria-label='Toggle menu'>
            {isMenuOpen ? (
              <X className='w-5 h-5 ' />
            ) : (
              <Menu className='w-5 h-5 ' />
            )}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className='lg:hidden fixed inset-0 bg-black/50 z-40' onClick={toggleMenu} />
      )}

      <div className={`lg:hidden fixed top-0 right-0 h-full w-64 bg-white border-l border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        <div className='p-6'>
          <div className='flex items-center justify-between mb-8'>
            <span className='text-lg font-semibold text-gray-800'>Menu</span>

            <button
              onClick={toggleMenu}
              className='p-2 rounded-md hover:bg-gray-100 transition-colors'>
              <X className='w-5 h-5 text-gray-700' />
            </button>
          </div>

          <div className='space-y-2'>
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 border-b border-gray-200 mb-3">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className='w-full'>
                      <p className="font-medium text-gray-900">
                        {userData?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {userData?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActivePath(item.path)
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      onClick={toggleMenu}>
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </>

            ) : (
              <>
                <Link
                  to="/signin"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-3 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 text-center"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

        </div>
      </div>

      <div className='h-20'></div>
    </>
  )
}

export default Navbar