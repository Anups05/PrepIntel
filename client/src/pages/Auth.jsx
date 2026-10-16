import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Shield, ArrowRight, X, Zap, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser, adminLogin } from "../services/authService";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [desiredBatch, setDesiredBatch] = useState("");

  const navigate = useNavigate();

  // Email validation
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Password strength checks
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    digit: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
  const isPasswordStrong = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login
        if (!email || !password) {
          setFormError("Please fill in all fields");
          setIsLoading(false);
          return;
        }
        await loginUser(email, password);
        navigate("/dashboard");
      } else {
        // Register - validate
        if (!name || !email || !password || !desiredBatch) {
          setFormError("Please fill in all fields");
          setIsLoading(false);
          return;
        }
        if (!isValidEmail(email)) {
          setFormError("Please enter a valid email address");
          setIsLoading(false);
          return;
        }
        if (!isPasswordStrong) {
          setFormError("Please meet all password requirements");
          setIsLoading(false);
          return;
        }
        await registerUser({ name, email, password, desiredBatch });
        navigate("/dashboard");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Please try again.";
      setFormError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);

    try {
      await adminLogin(adminEmail, adminPassword);
      navigate("/admin/dashboard");
      setShowAdminModal(false);
      setAdminEmail("");
      setAdminPassword("");
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid admin credentials";
      setLoginError(msg);
    } finally {
      setIsLoading(false);
    }
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
              <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-600">{loginError}</p>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input
                type="email"
                placeholder="admin@gmail.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                required
              />

              <div className="relative">
                <input
                  type={showAdminPassword ? "text" : "password"}
                  placeholder="Password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showAdminPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
              >
                {isLoading ? "Logging in..." : "Login as Admin"}
              </button>
            </form>
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
              onClick={() => { setIsLogin(true); setFormError(""); }}
              className={`flex-1 py-3 text-lg font-semibold rounded-xl transition ${isLogin
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLogin(false); setFormError(""); }}
              className={`flex-1 py-3 text-lg font-semibold rounded-xl transition ${!isLogin
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {formError && (
            <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-200">
              <p className="text-sm text-red-600">{formError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Desired Batch / Exam</label>
                  <select
                    value={desiredBatch}
                    onChange={(e) => setDesiredBatch(e.target.value)}
                    className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                    required
                  >
                    <option value="" disabled>Select your target exam</option>
                    <option value="JEE Advanced">JEE Advanced</option>
                    <option value="JEE Main">JEE Main</option>
                    <option value="NEET">NEET</option>
                    <option value="CET">CET</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFormError(""); }}
                className={`w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none ${email && !isValidEmail(email) ? 'border-red-400' : ''
                  }`}
                placeholder="Enter your email"
                required
              />
              {email && !isValidEmail(email) && (
                <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
              )}
            </div>

            <div className="relative">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFormError(""); }}
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

            {/* Password Strength Indicator — only for Sign Up */}
            {!isLogin && password && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-600 mb-2">Password Requirements:</p>
                {[
                  { key: "length", label: "At least 8 characters" },
                  { key: "uppercase", label: "One uppercase letter (A-Z)" },
                  { key: "lowercase", label: "One lowercase letter (a-z)" },
                  { key: "digit", label: "One digit (0-9)" },
                  { key: "special", label: "One special character (!@#$...)" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    {passwordChecks[key] ? (
                      <CheckCircle size={14} className="text-green-500" />
                    ) : (
                      <XCircle size={14} className="text-gray-300" />
                    )}
                    <span className={`text-xs ${passwordChecks[key] ? "text-green-600" : "text-gray-400"}`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            )}

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
              disabled={isLoading}
              className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition disabled:opacity-50"
            >
              {isLoading ? (isLogin ? "Logging in..." : "Creating Account...") : (isLogin ? "Login" : "Sign Up")}
            </motion.button>
          </form>

          {/* Toggle text */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setIsLogin(!isLogin); setFormError(""); }}
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