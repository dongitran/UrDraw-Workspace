"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCollectionDetails,
  fetchCollectionDrawings,
  createDrawing,
  deleteDrawing,
  updateDrawing,
  initializeDrawingContent,
} from "@/lib/api";
import { generateRandomThumbnail } from "@/lib/thumbnailGenerator";
import DrawingCard from "@/components/DrawingCard";
import CreateDrawingModal from "@/components/CreateDrawingModal";
import EditDrawingModal from "@/components/EditDrawingModal";
import Notification from "@/components/Notification";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function CollectionPage() {
  const { id: collectionId } = useParams();
  const { user, isAuthenticated, loading: authLoading, getToken } = useAuth();
  const router = useRouter();

  const [collection, setCollection] = useState(null);
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isShared, setIsShared] = useState(false);
  const [permission, setPermission] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated()) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated() && collectionId) {
      loadCollectionData();
    }
  }, [isAuthenticated, collectionId]);

  const loadCollectionData = async () => {
    try {
      setLoading(true);

      const collectionData = await getCollectionDetails(collectionId);
      setCollection(collectionData);

      const drawingsResponse = await fetchCollectionDrawings(collectionId);

      if (drawingsResponse.drawings) {
        setDrawings(drawingsResponse.drawings);
        setIsShared(drawingsResponse.isShared || false);
        setPermission(drawingsResponse.permission || null);
      } else {
        setDrawings(drawingsResponse);
        setIsShared(false);
        setPermission(null);
      }
    } catch (error) {
      console.error("Error loading collection data:", error);
      showNotification("Error loading collection data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDrawing = async (name, type = "excalidraw") => {
    if (isShared && permission !== "edit") {
      showNotification(
        "You don't have permission to create drawings in this collection",
        "error"
      );
      return;
    }

    try {
      const newDrawing = await createDrawing({
        name,
        collectionId,
        thumbnailUrl: generateRandomThumbnail(name),
        content: JSON.stringify({
          type,
          version: 2,
          source: "urdraw-workspace",
          elements: [],
        }),
        type,
      });

      initializeDrawingContent(newDrawing.id, name, type).catch((err) =>
        console.error("Error initializing drawing content:", err)
      );

      setDrawings([newDrawing, ...drawings]);
      setIsCreateModalOpen(false);
      showNotification("Drawing created successfully", "success");
    } catch (error) {
      console.error("Error creating drawing:", error);
      showNotification("Error creating drawing", "error");
    }
  };

  const handleEditDrawing = (drawing) => {
    if (isShared && permission !== "edit") {
      showNotification(
        "You don't have permission to edit drawings in this collection",
        "error"
      );
      return;
    }

    setSelectedDrawing(drawing);
    setIsEditModalOpen(true);
  };

  const handleUpdateDrawingName = async (name) => {
    try {
      const updatedDrawing = await updateDrawing(selectedDrawing.id, { name });

      setDrawings(
        drawings.map((d) =>
          d.id === updatedDrawing.id ? { ...d, name: updatedDrawing.name } : d
        )
      );

      setIsEditModalOpen(false);
      showNotification("Drawing name updated successfully", "success");
    } catch (error) {
      console.error("Error updating drawing name:", error);
      showNotification("Error updating drawing name", "error");
    }
  };

  const handleDeleteDrawing = async (drawingId) => {
    if (isShared && permission !== "edit") {
      showNotification(
        "You don't have permission to delete drawings in this collection",
        "error"
      );
      return;
    }

    try {
      await deleteDrawing(drawingId);
      setDrawings(drawings.filter((d) => d.id !== drawingId));
      showNotification("Drawing deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting drawing:", error);
      showNotification("Error deleting drawing", "error");
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" message="Loading collection..." />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Collection not found
          </h2>
          <p className="mt-2 text-gray-600">
            The collection you're looking for doesn't exist or you don't have
            access to it.
          </p>
          <button
            onClick={() => router.push("/workspace")}
            className="mt-4 btn-primary"
          >
            Back to Workspace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-lg md:text-2xl font-medium md:font-bold">
            {collection.name}
          </h1>

          {isShared && (
            <div className="mt-1 inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              {permission === "edit"
                ? "Shared (Can Edit)"
                : "Shared (View Only)"}
            </div>
          )}
        </div>

        {(!isShared || permission === "edit") && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="py-2 px-3 md:py-2 md:px-4 bg-blue-600 text-white rounded-lg text-sm md:text-base hover:bg-blue-700 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1 md:mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Create Drawing
          </button>
        )}
      </div>

      {drawings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No drawings yet.</p>
          {(!isShared || permission === "edit") && (
            <p className="mt-2">Create your first drawing to get started!</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {drawings.map((drawing) => (
            <DrawingCard
              key={drawing.id}
              drawing={drawing}
              onClick={() => handleOpenDrawing(drawing.id)}
              onDelete={
                !isShared || permission === "edit" ? handleDeleteDrawing : null
              }
              onEdit={
                !isShared || permission === "edit" ? handleEditDrawing : null
              }
            />
          ))}
        </div>
      )}

      <CreateDrawingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateDrawing}
      />

      <EditDrawingModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onEdit={handleUpdateDrawingName}
        initialName={selectedDrawing?.name}
      />
    </div>
  );
}
