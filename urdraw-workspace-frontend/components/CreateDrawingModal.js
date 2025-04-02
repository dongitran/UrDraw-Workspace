"use client";

import { useState } from "react";

export default function CreateDrawingModal({ isOpen, onClose, onCreate }) {
  const [drawingName, setDrawingName] = useState("");
  const [drawingType, setDrawingType] = useState("excalidraw");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!drawingName.trim()) {
      setError("Please enter a name for the drawing");
      return;
    }

    onCreate(drawingName, drawingType);

    setDrawingName("");
    setDrawingType("excalidraw");
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Create New Drawing
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="drawingName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Drawing Name
            </label>
            <input
              type="text"
              id="drawingName"
              className="input-field"
              value={drawingName}
              onChange={(e) => setDrawingName(e.target.value)}
              placeholder="Enter drawing name"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <div className="mb-4">
            <label
              htmlFor="drawingType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Drawing Type
            </label>
            <select
              id="drawingType"
              className="input-field"
              value={drawingType}
              onChange={(e) => setDrawingType(e.target.value)}
            >
              <option value="excalidraw">Excalidraw</option>
              <option value="mermaid">Mermaid</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Drawing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
