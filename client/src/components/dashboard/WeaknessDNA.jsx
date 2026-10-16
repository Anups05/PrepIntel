import React, { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { getStudentWeakTopics } from "../../services/testService";

export default function WeaknessDNA() {
  const [weaknesses, setWeaknesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getStudentWeakTopics();
        setWeaknesses(res.data.weakTopics || []);
      } catch (err) {
        console.error("Failed to fetch weak topics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={18} className="text-red-500" />
        <h3 className="font-semibold text-gray-800">Weakness DNA Mapping</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
        </div>
      ) : weaknesses.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No data yet — attempt some tests first!</p>
      ) : (
        <div className="space-y-4">
          {weaknesses.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <div>
                  <span className="font-medium text-gray-700">{item.topic}</span>
                  <span className="text-xs text-gray-400 ml-2">({item.subject})</span>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.errorRate >= 70 ? "bg-red-100 text-red-600" :
                    item.errorRate >= 50 ? "bg-orange-100 text-orange-600" :
                      "bg-yellow-100 text-yellow-600"
                  }`}>
                  {item.errorRate}% errors
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${item.errorRate}%`,
                    backgroundColor: item.errorRate >= 70 ? '#EF4444' : item.errorRate >= 50 ? '#F97316' : '#EAB308'
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-0.5 text-right">{item.totalAttempts} questions attempted</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
