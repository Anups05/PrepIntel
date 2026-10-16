import React, { useState, useEffect } from "react";
import { Flame, Trophy, Calendar, TrendingUp } from "lucide-react";
import { getStudentStreak } from "../services/testService";

const Streak = () => {
  const [streakData, setStreakData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        setIsLoading(true);
        const { data } = await getStudentStreak();
        setStreakData(data);
      } catch (err) {
        console.error("Failed to fetch streak data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStreak();
  }, []);

  const currentStreak = streakData?.currentStreak ?? 0;
  const largestStreak = streakData?.largestStreak ?? 0;
  const averageStreak = streakData?.avgStreak ?? 0;
  const activeDays = streakData?.activeDays ?? 0;
  const heatmap = streakData?.heatmap ?? {};

  // Generate full-year heatmap: 365 days ending today
  const generateYearDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = [];
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(d);
    }
    return dates;
  };

  const yearDates = generateYearDates();

  // Organize into weeks (columns) x days (rows)
  // First, find the start day of week for the first date
  const firstDay = yearDates[0].getDay(); // 0=Sun, 1=Mon, ...
  // We want Mon=0, so adjust
  const adjustDay = (d) => (d === 0 ? 6 : d - 1); // Mon=0, Tue=1, ..., Sun=6

  // Build weeks array
  const weeks = [];
  let currentWeek = [];
  // Pad the first week with nulls
  const firstAdjusted = adjustDay(yearDates[0].getDay());
  for (let i = 0; i < firstAdjusted; i++) {
    currentWeek.push(null);
  }
  yearDates.forEach(date => {
    currentWeek.push(date);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  // Get activity level for a date
  const getActivity = (date) => {
    if (!date) return 0;
    const ds = date.toISOString().split('T')[0];
    return heatmap[ds] || 0;
  };

  // Color based on test count
  const getHeatColor = (count) => {
    if (count === 0) return "bg-gray-200";
    if (count === 1) return "bg-purple-200";
    if (count === 2) return "bg-purple-400";
    return "bg-purple-600"; // 3+
  };

  // Month labels
  const getMonthLabels = () => {
    const labels = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      // Check the first non-null date in the week
      const firstDate = week.find(d => d !== null);
      if (firstDate) {
        const m = firstDate.getMonth();
        if (m !== lastMonth) {
          labels.push({ weekIndex: wi, label: firstDate.toLocaleDateString("en-US", { month: "short" }) });
          lastMonth = m;
        }
      }
    });
    return labels;
  };

  const monthLabels = getMonthLabels();
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="pb-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Practice Streak</h1>
        <p className="text-gray-500 mt-1">Your consistency drives success.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div></div>
      ) : (
        <>
          {/* Main Streak Card */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 mb-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-10 -mb-10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-white/20 rounded-xl">
                  <Flame size={32} className="text-white" />
                </div>
                <div>
                  <div className="text-6xl font-bold">{currentStreak}</div>
                  <p className="text-purple-100 mt-1 text-lg">Day Streak</p>
                </div>
              </div>
              <p className="text-purple-100 text-lg">
                {currentStreak > 0 ? "Keep it going! Practice every day." : "Take a test today to start your streak!"}
              </p>
            </div>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Trophy className="text-yellow-600" size={20} />
                </div>
                <h3 className="text-sm text-gray-500">Largest Streak</h3>
              </div>
              <p className="text-3xl font-bold text-gray-800">{largestStreak}</p>
              <p className="text-xs text-gray-400 mt-1">days</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <TrendingUp className="text-blue-600" size={20} />
                </div>
                <h3 className="text-sm text-gray-500">Average Streak</h3>
              </div>
              <p className="text-3xl font-bold text-gray-800">{averageStreak}</p>
              <p className="text-xs text-gray-400 mt-1">days</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Calendar className="text-purple-600" size={20} />
                </div>
                <h3 className="text-sm text-gray-500">Active Days</h3>
              </div>
              <p className="text-3xl font-bold text-gray-800">{activeDays}</p>
              <p className="text-xs text-gray-400 mt-1">total days</p>
            </div>
          </div>

          {/* Activity Heatmap — Full Year */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Activity Heatmap</h2>
                <p className="text-sm text-gray-500">Last 365 days — tests taken per day</p>
              </div>
            </div>

            {/* Month labels */}
            <div className="flex ml-12 mb-2">
              {weeks.map((_, wi) => {
                const ml = monthLabels.find(m => m.weekIndex === wi);
                return (
                  <div key={wi} className="text-xs text-gray-400 flex-shrink-0" style={{ width: '14px', marginRight: '2px' }}>
                    {ml ? ml.label : ""}
                  </div>
                );
              })}
            </div>

            {/* Heatmap grid */}
            <div className="flex">
              {/* Day labels */}
              <div className="flex flex-col mr-2 text-xs text-gray-400">
                {dayLabels.map((day, index) => (
                  <span key={index} style={{ height: '14px', marginBottom: '2px', lineHeight: '14px' }}>{index % 2 === 0 ? day : ""}</span>
                ))}
              </div>

              {/* Weeks */}
              <div className="flex gap-[2px] flex-1 overflow-x-auto">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[2px]">
                    {week.map((date, di) => (
                      <div
                        key={`${wi}-${di}`}
                        className={`rounded-sm ${date ? getHeatColor(getActivity(date)) : "bg-transparent"}`}
                        style={{ width: '14px', height: '14px' }}
                        title={date ? `${date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}: ${getActivity(date)} test(s)` : ""}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end mt-6 text-xs text-gray-400 gap-3">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 bg-gray-200 rounded-sm"></div>
                <div className="w-4 h-4 bg-purple-200 rounded-sm"></div>
                <div className="w-4 h-4 bg-purple-400 rounded-sm"></div>
                <div className="w-4 h-4 bg-purple-600 rounded-sm"></div>
              </div>
              <span>More</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Streak;