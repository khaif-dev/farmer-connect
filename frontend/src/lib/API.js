const API = import.meta.env.VITE_API_URI;

// Helper function to handle fetch requests
const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('authToken');
    const headers = { "Content-Type": "application/json" };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API}${endpoint}`, {
      headers,
      ...options,
    });

    const responseData = await res.json();

    if (!res.ok && res.status !== 400 && res.status !== 409) {
      throw new Error(responseData.message || 'Something went wrong');
    }

    return responseData;
  } catch (error) {
    console.error(`${options.method || 'GET'} ${endpoint} error:`, error.message);
    throw error;
  }
};

// Create user
export const createUser = (data) => apiRequest('/api/user', {
  method: 'POST',
  body: JSON.stringify(data),
});

// Get user
export const getUser = () => apiRequest('/api/user');

// Delete user
export const deleteUser = (data) => apiRequest('/api/user', {
  method: 'DELETE',
  body: JSON.stringify(data),
});

// Update user
export const updateUser = (id, data) => apiRequest(`/api/user/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
});

// Login user
export const loginUser = (data) => apiRequest('/api/user/login', {
  method: 'POST',
  body: JSON.stringify(data),
});

// Reset password
export const resetPassword = (data) => apiRequest('/api/user/reset-password', {
  method: 'POST',
  body: JSON.stringify(data),
});

// Farm API functions
export const createFarm = (data) => apiRequest('/api/farm', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const getFarms = () => apiRequest('/api/farm');

export const getFarm = (id) => apiRequest(`/api/farm/${id}`);

export const updateFarm = (id, data) => apiRequest(`/api/farm/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
});

export const deleteFarm = (id) => apiRequest(`/api/farm/${id}`, {
  method: 'DELETE',
});

// Animal API functions
export const createAnimal = (data) => apiRequest('/api/animal', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const getAnimals = () => apiRequest('/api/animal');

export const getAnimal = (id) => apiRequest(`/api/animal/${id}`);

export const updateAnimal = (id, data) => apiRequest(`/api/animal/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
});

export const deleteAnimal = (id) => apiRequest(`/api/animal/${id}`, {
  method: 'DELETE',
});

// Crop API functions
export const createCrop = (data) => apiRequest('/api/crop', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const getCrops = () => apiRequest('/api/crop');

export const getCrop = (id) => apiRequest(`/api/crop/${id}`);

export const updateCrop = (id, data) => apiRequest(`/api/crop/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
});

export const deleteCrop = (id) => apiRequest(`/api/crop/${id}`, {
  method: 'DELETE',
});

// Market API functions
export const marketAPI = {
  getListings: () => apiRequest('/api/market-listings'),
  getListing: (id) => apiRequest(`/api/market-listings/${id}`),
  getUserListings: () => apiRequest('/api/market-listings/user/listings'),
  createListing: (data) => apiRequest('/api/market-listings', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateListing: (id, data) => apiRequest(`/api/market-listings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteListing: (id) => apiRequest(`/api/market-listings/${id}`, {
    method: 'DELETE',
  }),
};

// Buyer Offer API functions
export const buyerOfferAPI = {
  getAll: () => apiRequest('/api/buyerOffer'),
  get: (id) => apiRequest(`/api/buyerOffer/${id}`),
  create: (data) => apiRequest('/api/buyerOffer', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiRequest(`/api/buyerOffer/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiRequest(`/api/buyerOffer/${id}`, {
    method: 'DELETE',
  }),
};

// User Profile API functions
export const userAPI = {
  getProfile: () => apiRequest('/api/user/profile'),
  getUserListings: () => apiRequest('/api/market-listings/user'),
  getUserTransactions: () => apiRequest('/api/transactions/user'),
};

// Chat API functions
export const chatAPI = {
  getChatHistory: (listingId, otherUserId) => apiRequest(`/api/chat/history/${listingId}/${otherUserId}`),
  getConversations: () => apiRequest('/api/chat/conversations'),
  markAsRead: (listingId, otherUserId) => apiRequest(`/api/chat/mark-read/${listingId}/${otherUserId}`, {
    method: 'PATCH'
  }),
};