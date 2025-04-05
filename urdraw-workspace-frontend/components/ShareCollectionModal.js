"use client";

import { useEffect, useState } from "react";
import { createCollectionInvite, getCollectionShares, removeCollectionShare, updateSharePermission } from "@/lib/api";

export default function ShareCollectionModal({ isOpen, onClose, collection }) {
  const [inviteCode, setInviteCode] = useState("");
  const [permission, setPermission] = useState("view");
  const [expiresInDays, setExpiresInDays] = useState("7");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [shares, setShares] = useState([]);
  const [showShares, setShowShares] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadShares = async () => {
    if (!collection || !showShares) return;

    try {
      setIsLoading(true);
      const shareData = await getCollectionShares(collection.id);
      setShares(shareData);
    } catch (error) {
      setError("Error loading shares: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  useState(() => {
    if (showShares) {
      loadShares();
    }
  }, [showShares, collection]);

  const handleCreateInvite = async (e) => {
    e.preventDefault();
    setError("");
    setInviteCode("");
    setCopied(false);

    try {
      setIsLoading(true);
      const data = await createCollectionInvite({
        collectionId: collection.id,
        permission,
        expiresInDays: parseInt(expiresInDays),
      });

      setInviteCode(data.inviteCode);
    } catch (error) {
      setError("Error creating invite: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveShare = async (shareId) => {
    if (confirm("Are you sure you want to remove this user's access?")) {
      try {
        setIsLoading(true);
        await removeCollectionShare(shareId);
        loadShares();
      } catch (error) {
        setError("Error removing share: " + (error.response?.data?.message || error.message));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUpdatePermission = async (shareId, newPermission) => {
    try {
      setIsLoading(true);
      await updateSharePermission(shareId, newPermission);
      loadShares();
    } catch (error) {
      setError("Error updating permission: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {showShares ? "Manage Collection Shares" : "Share Collecti123on"}
          </h2>
        </div>

        <div className="flex border-b mb-4">
          <button
            className={`py-2 px-4 ${!showShares ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
            onClick={() => setShowShares(false)}
          >
            Create Invite
          </button>
          <button
            className={`py-2 px-4 ${showShares ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
            onClick={() => setShowShares(true)}
          >
            Manage Shares
          </button>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {!showShares ? (
          <>
            {!inviteCode ? (
              <form onSubmit={handleCreateInvite}>
                <div className="mb-4">
                  <label htmlFor="permission" className="block text-sm font-medium text-gray-700 mb-1">
                    Permission
                  </label>
                  <select
                    id="permission"
                    className="input-field"
                    value={permission}
                    onChange={(e) => setPermission(e.target.value)}
                  >
                    <option value="view">View only</option>
                    <option value="edit">Edit</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="expiration" className="block text-sm font-medium text-gray-700 mb-1">
                    Expires in
                  </label>
                  <select
                    id="expiration"
                    className="input-field"
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(e.target.value)}
                  >
                    <option value="1">1 day</option>
                    <option value="7">7 days</option>
                    <option value="30">30 days</option>
                    <option value="0">Never</option>
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
                  <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? "Generating..." : "Generate Invite Code"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <p className="mb-2">Your invite code:</p>
                <div className="bg-gray-100 p-3 rounded-md flex items-center justify-between mb-4">
                  <code className="text-lg font-mono">{inviteCode}</code>
                  <button
                    onClick={handleCopyInviteCode}
                    className="text-blue-600 hover:text-blue-800"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                        <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Share this code with others to give them{" "}
                  <span className="font-medium">{permission === "view" ? "view-only" : "edit"}</span> access.
                </p>
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => setInviteCode("")}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Create New Code
                  </button>
                  <button onClick={onClose} className="btn-primary">
                    Done
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div>
            {isLoading ? (
              <div className="text-center py-4">Loading...</div>
            ) : shares.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No users have access to this collection yet.</p>
            ) : (
              <div className="overflow-y-auto max-h-64">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Permission
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {shares.map((share) => (
                      <tr key={share.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {share.sharedWithId.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <select
                            value={share.permission}
                            onChange={(e) => handleUpdatePermission(share.id, e.target.value)}
                            className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="view">View only</option>
                            <option value="edit">Edit</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleRemoveShare(share.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
