import React from "react";

const StatsCard = ({ title, value, subtitle, color }) => {
  return (
    <div className={`rounded-2xl p-5 shadow-md ${color}`}>
      <h3 className="text-sm text-gray-200">{title}</h3>
      <h2 className="text-3xl font-bold mt-2">{value}</h2>
      <p className="text-xs mt-1 text-gray-300">{subtitle}</p>
    </div>
  );
};

export default StatsCard; 