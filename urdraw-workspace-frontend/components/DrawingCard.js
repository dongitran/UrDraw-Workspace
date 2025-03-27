"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { buildUrDrawUrl } from "@/lib/config";
import { getToken } from "@/lib/keycloak";

export default function DrawingCard({ drawing, onClick, onDelete }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleCardClick = async (e) => {
    if (
      e.target.closest(".menu-button") ||
      e.target.closest(".menu-dropdown")
    ) {
      return;
    }

    try {
      const token = getToken();
      if (token) {
        const drawingUrl = buildUrDrawUrl(token, drawing.id);
        window.location.href = drawingUrl;
      }
    } catch (error) {
      console.error("Error opening drawing:", error);
    }
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (confirm(`Are you sure you want to delete drawing "${drawing.name}"?`)) {
      onDelete(drawing.id);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200 relative"
      onClick={handleCardClick}
    >
      {drawing.thumbnailUrl ? (
        <div className="h-40 bg-gray-200 relative">
          <img
            src={drawing.thumbnailUrl}
            alt={drawing.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-40 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-lg">No thumbnail</span>
        </div>
      )}

      <button
        ref={menuButtonRef}
        className="menu-button absolute top-2 right-2 p-1 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-700"
        onClick={toggleMenu}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="menu-dropdown absolute top-10 right-2 bg-white shadow-lg rounded-md py-1 z-10"
        >
          <button
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            onClick={handleDelete}
          >
            Delete drawing
          </button>
        </div>
      )}

      <div className="p-4">
        <h3
          className="font-medium text-gray-900 mb-1 truncate"
          title={drawing.name}
        >
          {drawing.name}
        </h3>
        <p className="text-sm text-gray-500">
          Updated: {formatDate(drawing.lastModified)}
        </p>
      </div>
    </div>
  );
}
