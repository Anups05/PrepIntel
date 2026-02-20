import { useNavigate } from "react-router-dom";

export default function Navbar({ showBack = false }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="flex justify-between items-center mb-6">
      {/* Back Button */}
      {showBack ? (
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
        >
          ← Back
        </button>
      ) : (
        <div />
      )}

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
      >
        Logout
      </button>
    </div>
  );
}