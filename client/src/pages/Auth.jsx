import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Shield, ArrowRight, X, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      navigate("/dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);

    setTimeout(() => {
      if (adminEmail === "admin@example.com" && adminPassword === "admin123") {
        localStorage.setItem("isAdmin", "true");
        navigate("/admin/dashboard");
        setShowAdminModal(false);
        setAdminEmail("");
        setAdminPassword("");
      } else {
        setLoginError("Invalid admin credentials");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 flex flex-col items-center justify-center p-4 relative">
      {/* Admin Button - Top Right */}
      <button
        onClick={() => setShowAdminModal(true)}
        className="absolute top-8 right-8 z-20 flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white hover:bg-white/20 transition border border-white/20"
      >
        <Shield size={18} />
        <span>Admin?</span>
        <ArrowRight size={16} />
      </button>

      {/* Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full relative"
          >
            <button
              onClick={() => setShowAdminModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-2">Admin Access</h2>
            <p className="text-gray-500 text-sm mb-6">Login to manage tests and users</p>

            {loginError && (
              <div className="mb-4 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600">{loginError}</p>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input
                type="email"
                placeholder="admin@example.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                required
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                {isLoading ? "Logging in..." : "Login as Admin"}
              </button>
            </form>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Demo: admin@example.com / admin123
            </p>
          </motion.div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="flex flex-col items-center w-full max-w-md">
        {/* PrepIntel Logo/Name - Centered above login box */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
            <Zap className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">PrepIntel</h1>
          <p className="text-purple-200 text-sm">AI-Powered Exam Preparation</p>
        </motion.div>

        {/* Auth Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl w-full p-8"
        >
          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 text-lg font-semibold rounded-xl transition ${
                isLogin 
                  ? "bg-purple-600 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 text-lg font-semibold rounded-xl transition ${
                !isLogin 
                  ? "bg-purple-600 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Enter your name"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="relative">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none pr-12"
                placeholder={isLogin ? "Enter your password" : "Create password"}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-sm text-purple-600 hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition"
            >
              {isLogin ? "Login" : "Sign Up"}
            </motion.button>
          </form>

          {/* Toggle text */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-600 font-semibold hover:underline"
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </p>
        </motion.div>
      </div>

    </div>
  );
};

export default Auth;