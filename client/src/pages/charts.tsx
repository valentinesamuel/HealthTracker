import { TrendsChart } from "@/components/trends-chart";
import { AnimatedTrendVisualizer } from "@/components/animated-trend-visualizer";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { BloodPressureReading } from "@shared/schema";

export default function Charts() {
  const { data: readings } = useQuery<BloodPressureReading[]>({
    queryKey: ["/api/blood-pressure"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/blood-pressure/stats"],
  });

  const last7Days = readings?.slice(-7) || [];
  const last30Days = readings?.slice(-30) || [];

  const getTrendIcon = (trend: string | null) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Charts & Trends</h1>
        </div>
      </header>

      <main className="px-4 py-4 space-y-6">
        {/* Animated Trend Visualizer */}
        <AnimatedTrendVisualizer data={readings || []} />

        {/* Health Status Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Health Status Overview</h3>
          
          {readings && readings.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-medical-blue">
                    {stats?.averageSystolic || 0}/{stats?.averageDiastolic || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Overall Average</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    {getTrendIcon(stats?.trend)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stats?.trend === 'decreasing' ? 'Improving' : 
                     stats?.trend === 'increasing' ? 'Attention Needed' : 'Stable'}
                  </p>
                </div>
              </div>
              
              {/* Latest vs Average Comparison */}
              {readings[0] && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Latest vs Average</h4>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Latest Reading:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {readings[0].systolic}/{readings[0].diastolic} mmHg
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600 dark:text-gray-400">Difference:</span>
                    <span className={`font-medium ${
                      readings[0].systolic > (stats?.averageSystolic || 0) 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {readings[0].systolic > (stats?.averageSystolic || 0) ? '+' : ''}
                      {readings[0].systolic - (stats?.averageSystolic || 0)}/
                      {readings[0].diastolic > (stats?.averageDiastolic || 0) ? '+' : ''}
                      {readings[0].diastolic - (stats?.averageDiastolic || 0)} mmHg
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No data available for analysis</p>
            </div>
          )}
        </div>

        {/* 7-Day Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">7-Day Trend</h3>
          <TrendsChart data={last7Days} />
        </div>

        {/* Blood Pressure Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">BP Categories</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">Normal</p>
                <p className="text-sm text-green-600 dark:text-green-300">Less than 120/80</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">Elevated</p>
                <p className="text-sm text-yellow-600 dark:text-yellow-300">120-129 / Less than 80</p>
              </div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-200">Stage 1</p>
                <p className="text-sm text-orange-600 dark:text-orange-300">130-139 / 80-89</p>
              </div>
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">Stage 2</p>
                <p className="text-sm text-red-600 dark:text-red-300">140/90 or higher</p>
              </div>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Reading Distribution */}
        {last30Days.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">30-Day Distribution</h3>
            
            <div className="space-y-2">
              {['Normal', 'Elevated', 'Stage 1', 'Stage 2'].map((category) => {
                const count = last30Days.filter(reading => {
                  const { systolic, diastolic } = reading;
                  switch (category) {
                    case 'Normal':
                      return systolic < 120 && diastolic < 80;
                    case 'Elevated':
                      return systolic >= 120 && systolic < 130 && diastolic < 80;
                    case 'Stage 1':
                      return (systolic >= 130 && systolic < 140) || (diastolic >= 80 && diastolic < 90);
                    case 'Stage 2':
                      return systolic >= 140 || diastolic >= 90;
                    default:
                      return false;
                  }
                }).length;
                
                const percentage = last30Days.length > 0 ? (count / last30Days.length) * 100 : 0;
                
                return (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{category}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            category === 'Normal' ? 'bg-green-500' :
                            category === 'Elevated' ? 'bg-yellow-500' :
                            category === 'Stage 1' ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-800 min-w-[3rem]">
                        {count} ({Math.round(percentage)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
