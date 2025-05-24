import { TrendingDown, TrendingUp, Activity, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getBPCategory } from "@/lib/blood-pressure";
import { formatDistanceToNow } from "date-fns";
import type { BloodPressureReading } from "@shared/schema";

export function StatsOverview() {
  const { data: latestReading } = useQuery<BloodPressureReading>({
    queryKey: ["/api/blood-pressure/latest"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/blood-pressure/stats"],
  });

  if (!latestReading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
        <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-text-dark mb-2">No Readings Yet</h2>
        <p className="text-gray-500">Add your first blood pressure reading below</p>
      </div>
    );
  }

  const category = getBPCategory(latestReading.systolic, latestReading.diastolic);
  const recordedDate = new Date(latestReading.recordedAt);

  const getTrendIcon = (trend: string | null) => {
    switch (trend) {
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendText = (trend: string | null) => {
    switch (trend) {
      case 'decreasing':
        return 'Improving trend';
      case 'increasing':
        return 'Rising trend';
      default:
        return 'Stable readings';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
      <div className="text-center mb-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Latest Reading</h2>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-3xl font-bold text-medical-blue">{latestReading.systolic}</span>
          <span className="text-2xl text-gray-400">/</span>
          <span className="text-3xl font-bold text-medical-blue">{latestReading.diastolic}</span>
          <span className="text-sm text-gray-500 ml-1">mmHg</span>
        </div>
        <div className="flex items-center justify-center space-x-2 mt-2">
          <span className={`px-3 py-1 text-sm rounded-full ${category.bgColor} ${category.textColor}`}>
            {category.category}
          </span>
          {latestReading.pulse && (
            <span className="text-sm text-gray-600">💓 {latestReading.pulse} bpm</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {formatDistanceToNow(recordedDate, { addSuffix: true })}
        </p>
      </div>
      
      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            {getTrendIcon(stats?.trend)}
          </div>
          <p className="text-xs text-gray-500">Trend</p>
          <p className="text-sm font-medium text-text-dark">
            {getTrendText(stats?.trend)}
          </p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Activity className="h-4 w-4 text-medical-blue" />
          </div>
          <p className="text-xs text-gray-500">Average</p>
          <p className="text-sm font-medium text-text-dark">
            {stats?.averageSystolic || 0}/{stats?.averageDiastolic || 0}
          </p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Calendar className="h-4 w-4 text-medical-blue" />
          </div>
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-sm font-medium text-text-dark">
            {stats?.totalReadings || 0} readings
          </p>
        </div>
      </div>
    </div>
  );
}
