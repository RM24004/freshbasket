import axios from "axios";

const API_URL = "http://localhost:8080/api/users";

// GET all users
export const getAllUsers = async () => (await axios.get(API_URL)).data;

// GET user by ID
export const getUserById = async (user_id) => (await axios.get(`${API_URL}/${user_id}`)).data;

// CREATE user
export const createUser = async (user) => {
  try {
    const res = await axios.post(API_URL, user, {
      headers: {
        'Content-Type': 'application/json'
        // 'Authorization': `Bearer ${token}` // <--- SOLO si tu registro es privado
      }
    });
    return res.data;
  } catch (err) {
    // ... tu catch actual
  }
};


// UPDATE user
export const updateUser = async (user_id, user) => (await axios.put(`${API_URL}/${user_id}`, user)).data;

// DELETE user
export const deleteUser = async (user_id) => {
  const res = await axios.delete(`${API_URL}/${user_id}`);
  return res.status; // devuelve el código de estado
};


// SEARCH users by name
export const searchUsersByName = async (name) => (await axios.get(`${API_URL}/search?name=${name}`)).data;

