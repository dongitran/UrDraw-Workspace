"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import SearchBar from "./SearchBar";

export default function Header() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const menuRef = useRef();
  const buttonRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    logout();
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <header className="bg-white shadow-sm py-3 px-4">
      {/* When mobile search is not open, show regular header */}
      {!isSearchOpen && (
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-blue-600 font-bold text-xl mr-2">UrDraw</div>
            <div className="text-gray-600 text-sm hidden md:block">
              Workspace
            </div>
          </div>

          <div className="hidden md:block flex-1 mx-4">
            <SearchBar />
          </div>

          <div className="flex items-center">
            {/* Mobile search button */}
            <button
              className="md:hidden mr-3 p-2 rounded-md text-gray-500 hover:bg-gray-100"
              onClick={toggleSearch}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <div className="relative">
              <button
                ref={buttonRef}
                className="flex items-center space-x-2 bg-white hover:bg-gray-50 py-2 px-3 rounded-md border border-gray-300"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {user?.username?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <span className="ml-2 font-medium hidden md:inline">
                    {user?.username || "User"}
                  </span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500 hidden md:block"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {isMenuOpen && (
                <div
                  ref={menuRef}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200"
                >
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                    Logged in as{" "}
                    <span className="font-medium">{user?.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isSearchOpen && (
        <div className="md:hidden">
          <SearchBar isMobile={true} onCancel={toggleSearch} />
        </div>
      )}
    </header>
  );
}
