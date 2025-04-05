"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { buildUrDrawUrl } from "@/lib/config";
import { getToken } from "@/lib/keycloak";
import { getDrawingContentFromBackend } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function DrawingCard({ drawing, onClick, onDelete, onEdit }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
      setIsLoading(true);

      const token = getToken();
      if (token) {
        const drawingContent = JSON.parse(drawing.content);
        if (drawingContent?.type === "mermaid") {
          const data = await getDrawingContentFromBackend(drawing.id);

          const drawingUrl = buildUrDrawUrl(token, drawing.id, drawing?.type);
          window.location.href = drawingUrl + "#" + data.content;
        } else {
          const drawingUrl = buildUrDrawUrl(token, drawing.id, drawing?.type);
          window.location.href = drawingUrl;
        }
      }
    } catch (error) {
      console.error("Error opening drawing:", error);
      setIsLoading(false);
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

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onEdit(drawing);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTypeIcon = () => {
    if (drawing.type === "mermaid") {
      return (
        <div className="absolute top-2 left-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
          Mermaid
        </div>
      );
    } else {
      return (
        <div className="absolute top-2 left-2 bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Excalidraw
        </div>
      );
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200 relative"
      onClick={handleCardClick}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
          <LoadingSpinner size="medium" message="Loading..." />
        </div>
      )}

      {drawing.thumbnailUrl ? (
        <div className="h-40 bg-gray-200 relative">
          <img
            src={drawing.thumbnailUrl}
            alt={drawing.name}
            className="w-full h-full object-cover"
          />
          {getTypeIcon()}
        </div>
      ) : (
        <div className="h-40 bg-gray-200 flex items-center justify-center relative">
          <span className="text-gray-400 text-lg">No thumbnail</span>
          {getTypeIcon()}
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
          {onEdit && (
            <button
              className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
              onClick={handleEdit}
            >
              Edit Name
            </button>
          )}
          {onDelete && (
            <button
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              onClick={handleDelete}
            >
              Delete Drawing
            </button>
          )}
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
