export default function WeaknessDNA() {
  const weaknesses = [
    { topic: "Permutation & Combination", score: 40 },
    { topic: "Thermodynamics", score: 35 },
    { topic: "Electrochemistry", score: 50 },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="font-semibold mb-4">Weakness DNA Mapping</h3>

      <div className="space-y-4">
        {weaknesses.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm">
              <span>{item.topic}</span>
              <span>{item.score}% Weak</span>
            </div>

            <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{ width: `${item.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
