"use client";

import { useState, useEffect, useRef } from "react";

export default function CollectionCard({ collection, onClick, onDelete, onEdit }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const handleCardClick = (e) => {
    if (e.target.closest(".menu-button") || e.target.closest(".menu-dropdown")) {
      return;
    }
    onClick(collection.id);
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (confirm(`Are you sure you want to delete the collection "${collection.name}"?`)) {
      onDelete(collection.id);
    }
  };

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

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onEdit(collection);
  };

  return (
    <div
      className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200 relative"
      onDoubleClick={handleCardClick}
    >
      <div className="h-40 bg-blue-100 flex items-center justify-center">
        <div className="text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <p className="mt-2 text-lg font-medium text-gray-700">{collection.drawingCount || 0} drawings</p>
        </div>
      </div>

      <button
        ref={buttonRef}
        className="menu-button absolute top-2 right-2 p-1 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-700"
        onClick={toggleMenu}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {isMenuOpen && (
        <div ref={menuRef} className="menu-dropdown absolute top-10 right-2 bg-white shadow-lg rounded-md py-1 z-10">
          <button className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50" onClick={handleEdit}>
            Edit Name
          </button>
          <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50" onClick={handleDelete}>
            Delete Collection
          </button>
        </div>
      )}

      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 truncate" title={collection.name}>
          {collection.name}
        </h3>
      </div>
    </div>
  );
}
