"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCollectionDetails } from "@/lib/api";

export default function Breadcrumb() {
  const pathname = usePathname();
  const router = useRouter();
  const [collectionName, setCollectionName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCollectionName = async () => {
      if (pathname.startsWith("/workspace/collection/")) {
        setLoading(true);
        const collectionId = pathname.split("/").pop();
        try {
          const collection = await getCollectionDetails(collectionId);
          setCollectionName(collection.name);
        } catch (error) {
          console.error("Error fetching collection details:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCollectionName();
  }, [pathname]);

  if (!pathname.startsWith("/workspace")) {
    return null;
  }

  const isCollectionPage = pathname.startsWith("/workspace/collection/");

  return (
    <nav className="bg-white px-4 py-3 border-b border-gray-200">
      <ol className="flex items-center text-sm">
        <li className="flex items-center">
          <button
            onClick={() => router.push("/workspace")}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Workspace
          </button>
        </li>

        {isCollectionPage && (
          <>
            <li className="mx-2 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </li>
            <li className="text-gray-800 font-medium">
              {loading ? "Loading..." : collectionName}
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}
