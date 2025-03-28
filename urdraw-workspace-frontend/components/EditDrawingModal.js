"use client";

import { useState, useEffect } from "react";

export default function EditDrawingModal({
  isOpen,
  onClose,
  onEdit,
  initialName,
}) {
  const [drawingName, setDrawingName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && initialName) {
      setDrawingName(initialName);
    }
  }, [isOpen, initialName]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!drawingName.trim()) {
      setError("Please enter a name for the drawing");
      return;
    }

    onEdit(drawingName);
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Edit Drawing Name</h2>
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

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
