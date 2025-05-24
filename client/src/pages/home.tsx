import { Heart } from "lucide-react";
import { StatsOverview } from "@/components/stats-overview";
import { BloodPressureForm } from "@/components/blood-pressure-form";
import { ReadingCard } from "@/components/reading-card";
import { TrendsChart } from "@/components/trends-chart";
import { useQuery } from "@tanstack/react-query";
import type { BloodPressureReading } from "@shared/schema";

export default function Home() {
  const { data: readings, isLoading } = useQuery<BloodPressureReading[]>({
    queryKey: ["/api/blood-pressure"],
  });

  const recentReadings = readings?.slice(0, 3) || [];

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-medical-blue rounded-lg flex items-center justify-center">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">BP Tracker</h1>
          </div>
        </div>
      </header>

      <main className="px-4">
        {/* Stats Overview */}
        <section className="mt-6 mb-6">
          <StatsOverview />
        </section>

        {/* Quick Add Reading */}
        <section className="mb-6">
          <BloodPressureForm />
        </section>

        {/* Recent Readings */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Readings</h3>
            <a href="/history" className="text-medical-blue text-sm font-medium touch-target">
              View All
            </a>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm animate-pulse">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : recentReadings.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm text-center">
              <Heart className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No readings yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add your first blood pressure reading above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReadings.map((reading) => (
                <ReadingCard key={reading.id} reading={reading} />
              ))}
            </div>
          )}
        </section>

        {/* Trends Chart */}
        <section className="mb-6">
          <TrendsChart data={readings} />
        </section>

        {/* Health Insight */}
        <section className="mb-6">
          <div className="bg-gradient-to-r from-medical-blue to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Health Insight</h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  Track your blood pressure regularly for better health monitoring. 
                  Consistent readings help identify patterns and trends.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
