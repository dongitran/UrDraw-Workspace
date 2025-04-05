import axios from "axios";
import { getToken, updateToken, logout } from "./keycloak";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const tokenUpdated = await updateToken(60);

      if (!tokenUpdated) {
        await logout();
        return Promise.reject(new Error("Token refresh failed"));
      }
    } catch (error) {
      console.error("Token update error:", error);
      await logout();
      return Promise.reject(error);
    }

    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 ||
      (error.response?.data?.error === "invalid_grant" && !originalRequest._retry)
    ) {
      originalRequest._retry = true;

      try {
        await logout();
      } catch (logoutError) {
        console.error("Automatic logout failed:", logoutError);
      }
    }

    return Promise.reject(error);
  }
);

export const fetchUserDrawings = async () => {
  try {
    const response = await apiClient.get("/drawings");
    return response.data;
  } catch (error) {
    console.error("Error fetching drawings:", error);
    throw error;
  }
};

export const deleteDrawing = async (drawingId) => {
  try {
    const response = await apiClient.delete(`/drawings/${drawingId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting drawing:", error);
    throw error;
  }
};

export const createDrawing = async (drawingData) => {
  try {
    const response = await apiClient.post("/drawings", drawingData);
    return response.data;
  } catch (error) {
    console.error("Error creating drawing:", error);
    throw error;
  }
};

export const initializeDrawingContent = async (drawId, title, type = "excalidraw") => {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = getToken();

    const response = await axios.post(
      `${backendUrl}/drawing`,
      { drawId, title, type },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error initializing drawing content:", error);
    return null;
  }
};

export const getDrawingDetails = async (drawingId) => {
  try {
    const response = await apiClient.get(`/drawings/${drawingId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting drawing details:", error);
    throw error;
  }
};

export const updateDrawing = async (drawingId, updateData) => {
  try {
    const response = await apiClient.put(`/drawings/${drawingId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Error updating drawing:", error);
    throw error;
  }
};

export const fetchUserCollections = async () => {
  try {
    const response = await apiClient.get("/collections");
    return response.data;
  } catch (error) {
    console.error("Error fetching collections:", error);
    throw error;
  }
};

export const getCollectionDetails = async (collectionId) => {
  try {
    const response = await apiClient.get(`/collections/${collectionId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting collection details:", error);
    throw error;
  }
};

export const fetchCollectionDrawings = async (collectionId) => {
  try {
    const response = await apiClient.get(`/collections/${collectionId}/drawings`);
    return response.data;
  } catch (error) {
    console.error("Error fetching collection drawings:", error);
    throw error;
  }
};

export const createCollection = async (collectionData) => {
  try {
    const response = await apiClient.post("/collections", collectionData);
    return response.data;
  } catch (error) {
    console.error("Error creating collection:", error);
    throw error;
  }
};
export const WorkspaceApi = () => {
  const path = "/workspaces";
  const post = async ({ name, description }) => {
    const response = await apiClient.post(path, { description, name });
    return response.data;
  };
  const get = async () => {
    const res = await apiClient.get(path);
    return res.data;
  };
  const detail = async (id) => {
    const res = await apiClient.get(`${path}/${id}`);
    return res.data;
  };
  const patch = async (id, body) => {
    const res = await apiClient.patch(`${path}/${id}`, body);
    return res.data;
  };
  const _delete = async (id) => {
    const res = await apiClient.delete(`${path}/${id}`);
    return res.data;
  };
  return { post, get, detail, patch, delete: _delete };
};

export const updateCollection = async (collectionId, collectionData) => {
  try {
    const response = await apiClient.put(`/collections/${collectionId}`, collectionData);
    return response.data;
  } catch (error) {
    console.error("Error updating collection:", error);
    throw error;
  }
};

export const deleteCollection = async (collectionId) => {
  try {
    const response = await apiClient.delete(`/collections/${collectionId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting collection:", error);
    throw error;
  }
};
export const CollectionShareApi = (path = "/shares") => {
  const invite = async (data) => {
    const res = await apiClient.post(`${path}/invite`, data);
    return res.data;
  };
  return { invite };
};
export const createCollectionInvite = async (data) => {
  try {
    const response = await apiClient.post("/shares/invite", data);
    return response.data;
  } catch (error) {
    console.error("Error creating collection invite:", error);
    throw error;
  }
};

export const joinCollectionWithCode = async (inviteCode) => {
  try {
    const response = await apiClient.post("/shares/join", { inviteCode });
    return response.data;
  } catch (error) {
    console.error("Error joining collection:", error);
    throw error;
  }
};

export const getSharedCollections = async () => {
  try {
    const response = await apiClient.get("/shares/collections");
    return response.data;
  } catch (error) {
    console.error("Error fetching shared collections:", error);
    throw error;
  }
};

export const getCollectionShares = async (collectionId) => {
  try {
    const response = await apiClient.get(`/shares/collection/${collectionId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching collection shares:", error);
    throw error;
  }
};

export const updateSharePermission = async (shareId, permission) => {
  try {
    const response = await apiClient.put(`/shares/${shareId}`, { permission });
    return response.data;
  } catch (error) {
    console.error("Error updating share permission:", error);
    throw error;
  }
};

export const removeCollectionShare = async (shareId) => {
  try {
    const response = await apiClient.delete(`/shares/${shareId}`);
    return response.data;
  } catch (error) {
    console.error("Error removing collection share:", error);
    throw error;
  }
};

export const getAllCollectionsAndDrawings = async () => {
  try {
    const response = await apiClient.get("/collections/all/data");
    return response.data;
  } catch (error) {
    console.error("Error fetching all collections and drawings:", error);
    throw error;
  }
};

export const getDrawingContentFromBackend = async (drawingId) => {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = getToken();

    const response = await axios.get(`${backendUrl}/drawing/${drawingId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching drawing content from backend:", error);
    throw error;
  }
};

export default apiClient;
