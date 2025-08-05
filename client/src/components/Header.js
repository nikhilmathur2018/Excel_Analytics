// client/src/components/Header.js
import React, { useState } from 'react'; // Added useState for mobile menu
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom'; // Added useLocation
import { logout, reset } from '../features/auth/authSlice';

function Header() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const location = useLocation(); // Get current path for active link
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu

    const onLogout = () => {
        dispatch(logout());
        dispatch(reset());
        navigate('/login');
        setIsMobileMenuOpen(false); // Close menu on logout
    };

    const navLinks = user ? [
        { path: "/upload", label: "Upload File" },
        { path: "/history", label: "History" },
        ...(user.role === 'admin' ? [{ path: "/admin", label: "Admin Panel" }] : [])
    ] : [
        { path: "/login", label: "Login" },
        { path: "/register", label: "Register" }
    ];

    return (
        <header className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-4 shadow-lg sticky top-0 z-40">
            <div className="container mx-auto flex justify-between items-center relative">
                {/* Logo/App Name */}
                <Link to={user ? "/dashboard" : "/"} className="text-2xl font-bold flex items-center group">
                    <svg className="w-8 h-8 mr-2 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    <span className="group-hover:text-purple-100 transition duration-300">Excel Analytics</span>
                </Link>

                {/* Mobile Menu Button (Hamburger) */}
                <div className="block lg:hidden">
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white focus:outline-none">
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden lg:block">
                    <ul className="flex space-x-6 items-center">
                        {navLinks.map(link => (
                            <li key={link.path}>
                                <Link
                                    to={link.path}
                                    className={`relative py-2 px-1 font-medium transition duration-300 ease-in-out
                                                ${location.pathname === link.path
                                                ? 'text-white border-b-2 border-white'
                                                : 'text-purple-100 hover:text-white hover:border-b-2 hover:border-purple-300'
                                            }`}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                        {user && (
                            <li className="ml-4">
                                <button
                                    onClick={onLogout}
                                    className="bg-purple-800 hover:bg-purple-900 px-4 py-2 rounded-full text-sm font-semibold transition duration-300 flex items-center shadow-md hover:shadow-lg"
                                >
                                    <svg className="w-5 h-5 mr-1 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H5a3 3 0 01-3-3V7a3 3 0 013-3h5a3 3 0 013 3v1"></path></svg>
                                    Logout
                                </button>
                            </li>
                        )}
                        {user && (
                            <li className="ml-4 text-sm bg-purple-600 px-3 py-1 rounded-full flex items-center">
                                <span className="mr-1">Hello,</span>
                                <span className="font-semibold">{user.name || 'User'}</span>
                                {user.role === 'admin' && (
                                    <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-400 text-gray-900 rounded-full font-bold">Admin</span>
                                )}
                            </li>
                        )}
                    </ul>
                </nav>

                {/* Mobile Navigation (Conditional Rendering) */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden absolute top-full left-0 w-full bg-purple-700 shadow-lg py-2 rounded-b-lg animate-slideInDown">
                        <ul className="flex flex-col items-center space-y-3 py-2">
                            {navLinks.map(link => (
                                <li key={link.path} className="w-full text-center">
                                    <Link
                                        to={link.path}
                                        onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
                                        className={`block py-2 px-4 w-full transition duration-200 ease-in-out
                                                    ${location.pathname === link.path
                                                        ? 'bg-purple-600 text-white font-bold'
                                                        : 'text-purple-100 hover:bg-purple-600 hover:text-white'
                                                    }`}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                            {user && (
                                <li className="w-full text-center mt-3 pt-3 border-t border-purple-600">
                                    <button
                                        onClick={onLogout}
                                        className="w-auto px-6 py-2 bg-purple-800 hover:bg-purple-900 rounded-full text-sm font-semibold transition duration-300 flex items-center justify-center mx-auto"
                                    >
                                        <svg className="w-5 h-5 mr-1 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H5a3 3 0 01-3-3V7a3 3 0 013-3h5a3 3 0 013 3v1"></path></svg>
                                        Logout
                                    </button>
                                </li>
                            )}
                            {user && (
                                <li className="text-sm bg-purple-600 px-3 py-1 rounded-full flex items-center mt-2">
                                    <span className="mr-1">Hello,</span>
                                    <span className="font-semibold">{user.name || 'User'}</span>
                                    {user.role === 'admin' && (
                                        <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-400 text-gray-900 rounded-full font-bold">Admin</span>
                                    )}
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;