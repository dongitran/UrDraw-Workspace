"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAllCollectionsAndDrawings } from "@/lib/api";
import { getToken } from "@/lib/keycloak";
import { buildUrDrawUrl } from "@/lib/config";

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allData, setAllData] = useState(null);
  const searchContainerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        const data = await getAllCollectionsAndDrawings();
        setAllData(data);
      } catch (error) {
        console.error("Error fetching search data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!allData || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();

    const filteredCollections = allData.collections
      .filter((collection) => collection.name.toLowerCase().includes(query))
      .map((collection) => ({
        id: collection.id,
        name: collection.name,
        type: "collection",
        isShared: collection.isShared,
        permission: collection.permission,
      }));

    const filteredDrawings = allData.drawings
      .filter((drawing) => drawing.name.toLowerCase().includes(query))
      .map((drawing) => ({
        id: drawing.id,
        name: drawing.name,
        type: "drawing",
        collectionId: drawing.collectionId,
        thumbnailUrl: drawing.thumbnailUrl,
      }));

    setSearchResults(
      [...filteredCollections, ...filteredDrawings].slice(0, 10)
    );
  }, [searchQuery, allData]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowResults(e.target.value.trim() !== "");
  };

  const handleResultClick = async (result) => {
    setShowResults(false);
    setSearchQuery("");

    if (result.type === "collection") {
      router.push(`/workspace/collection/${result.id}`);
    } else if (result.type === "drawing") {
      try {
        const token = getToken();
        if (!token) {
          console.error("No token available");
          return;
        }

        const drawingUrl = buildUrDrawUrl(token, result.id);
        window.location.href = drawingUrl;
      } catch (error) {
        console.error("Error opening drawing:", error);
      }
    }
  };

  return (
    <div className="relative w-full max-w-md mx-4" ref={searchContainerRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search collections and drawings..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => {
            if (searchQuery.trim() !== "") {
              setShowResults(true);
            }
          }}
        />
        <svg
          className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {showResults && (
        <div className="absolute w-full mt-1 bg-white rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : searchResults.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchQuery.trim() !== ""
                ? "No results found"
                : "Type to search"}
            </div>
          ) : (
            <ul className="py-1">
              {searchResults.map((result) => (
                <li
                  key={`${result.type}-${result.id}`}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="px-4 py-2 flex items-center">
                    {result.type === "collection" ? (
                      <div className="mr-3 w-8 h-8 bg-blue-100 flex items-center justify-center rounded-md">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-600"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="mr-3 w-8 h-8 bg-gray-100 flex items-center justify-center rounded-md">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-600"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {result.name}
                      </div>
                      {result.isShared && (
                        <div className="text-xs text-blue-600">
                          Shared (
                          {result.permission === "edit"
                            ? "Can Edit"
                            : "View Only"}
                          )
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
