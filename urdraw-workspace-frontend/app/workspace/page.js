"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchUserCollections,
  createCollection,
  deleteCollection,
  getSharedCollections,
  updateCollection,
} from "@/lib/api";
import CollectionCard from "@/components/CollectionCard";
import CreateCollectionModal from "@/components/CreateCollectionModal";
import EditCollectionModal from "@/components/EditCollectionModal";
import ShareCollectionModal from "@/components/ShareCollectionModal";
import JoinCollectionModal from "@/components/JoinCollectionModal";
import Notification from "@/components/Notification";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "sonner";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { Button } from "@/components/ui/button";

dayjs.extend(advancedFormat);

export default function WorkspacePage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [collections, setCollections] = useState([]);
  const [sharedCollections, setSharedCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const actionButtonRef = useRef(null);
  const actionMenuRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated()) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated()) {
      loadCollections();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isActionMenuOpen &&
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target) &&
        actionButtonRef.current &&
        !actionButtonRef.current.contains(event.target)
      ) {
        setIsActionMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isActionMenuOpen]);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const [ownedCollections, shared] = await Promise.all([fetchUserCollections(), getSharedCollections()]);
      setCollections(ownedCollections);
      setSharedCollections(shared);
    } catch (error) {
      console.error("Error loading collections:", error);
      showNotification("Error loading collections", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCollection = (collectionId) => {
    router.push(`/workspace/collection/${collectionId}`);
  };

  const handleCreateCollection = async (name, callback) => {
    try {
      const newCollection = await createCollection({ name });
      toast.success("Collection created successfully");
      setCollections([newCollection, ...collections]);
      setIsCreateModalOpen(false);
      if (callback) callback();
    } catch (error) {
      console.error("Error creating collection:", error);
      toast.error("Error creating collection");
    }
  };

  const handleEditCollection = (collection) => {
    setSelectedCollection(collection);
    setIsEditModalOpen(true);
  };

  const handleUpdateCollectionName = async (name) => {
    try {
      const updatedCollection = await updateCollection(selectedCollection.id, {
        name,
      });
      setCollections(
        collections.map((c) => (c.id === updatedCollection.id ? { ...c, name: updatedCollection.name } : c))
      );
      setIsEditModalOpen(false);
      showNotification("Collection name updated successfully", "success");
    } catch (error) {
      console.error("Error updating collection name:", error);
      showNotification("Error updating collection name", "error");
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    try {
      await deleteCollection(collectionId);
      setCollections(collections.filter((c) => c.id !== collectionId));
      toast.message("Collection deleted successfully", {
        description: dayjs().format("dddd, MMMM Do [at] h:mma"),
      });
    } catch (error) {
      console.error("Error deleting collection:", error);
      // showNotification("Error deleting collection", "error");
    }
  };

  const handleShareCollection = (collection) => {
    setSelectedCollection(collection);
    setIsShareModalOpen(true);
  };

  const handleJoinSuccess = () => {
    loadCollections();
    showNotification("Successfully joined collection", "success");
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
  };

  const handleActionClick = () => {
    setIsActionMenuOpen(!isActionMenuOpen);
  };

  const openJoinModal = () => {
    setIsActionMenuOpen(false);
    setIsJoinModalOpen(true);
  };

  const openCreateModal = () => {
    setIsActionMenuOpen(false);
    setIsCreateModalOpen(true);
  };

  if (authLoading || (loading && !collections.length && !sharedCollections.length)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" message="Loading workspace..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">My Collections</h2>
          <div className="md:hidden relative">
            <button
              ref={actionButtonRef}
              onClick={handleActionClick}
              className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
              </svg>
              Actions
            </button>

            {isActionMenuOpen && (
              <div
                ref={actionMenuRef}
                className="absolute z-10 right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <button
                  onClick={openJoinModal}
                  className="w-full text-left px-4 py-3 flex items-center hover:bg-gray-100 border-b border-gray-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-green-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                  Join Collection 123
                </button>
                <button
                  onClick={openCreateModal}
                  className="w-full text-left px-4 py-3 flex items-center hover:bg-gray-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-blue-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Create Collection
                </button>
              </div>
            )}
          </div>

          <div className="hidden md:flex space-x-3">
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsJoinModalOpen(true)}>
              Join Collection
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-600" onClick={() => setIsCreateModalOpen(true)}>
              Create Collection
            </Button>
          </div>
        </div>

        {collections.length === 0 ? (
          <p className="text-gray-500">No collections yet. Create your first collection!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {collections.map((collection) => (
              <div key={collection.id} className="relative">
                <CollectionCard
                  collection={collection}
                  onClick={() => handleOpenCollection(collection.id)}
                  onDelete={handleDeleteCollection}
                  onEdit={handleEditCollection}
                />
                <button
                  onClick={() => handleShareCollection(collection)}
                  className="absolute top-2 left-2 p-1 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 text-blue-600"
                  title="Share Collection1231"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {sharedCollections.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">Shared With Me</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sharedCollections.map((collection) => (
              <div key={collection.id} className="relative">
                <CollectionCard
                  collection={{
                    ...collection,
                    name: `${collection.name} (${collection.permission === "view" ? "View" : "Edit"})`,
                  }}
                  onClick={() => handleOpenCollection(collection.id)}
                />
                <div className="absolute top-2 left-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  Shared
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CreateCollectionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateCollection}
      />

      <EditCollectionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onEdit={handleUpdateCollectionName}
        initialName={selectedCollection?.name}
      />

      <ShareCollectionModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        collection={selectedCollection}
      />

      <JoinCollectionModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSuccess={handleJoinSuccess}
      />
    </div>
  );
}
