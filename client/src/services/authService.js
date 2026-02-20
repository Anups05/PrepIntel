// services/authService.js

// REGISTER USER (Mock - localStorage for now)
export const registerUser = async (userData) => {
  const users = JSON.parse(localStorage.getItem("users")) || [];

  const userExists = users.find(
    (user) => user.email === userData.email
  );

  if (userExists) {
    throw new Error("User already exists");
  }

  users.push(userData);
  localStorage.setItem("users", JSON.stringify(users));

  return { message: "Registered successfully" };
};

// LOGIN USER (THIS is what your Login.jsx needs)
export const loginUser = async (email, password) => {
  const users = JSON.parse(localStorage.getItem("users")) || [];

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Simulated token (backend-ready structure)
  const fakeToken = "loop-auth-token";

  localStorage.setItem("token", fakeToken);
  localStorage.setItem("user", JSON.stringify(user));

  return {
    token: fakeToken,
    user,
  };
};

// LOGOUT (future use)
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// GET CURRENT USER (for protected routes later)
export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};