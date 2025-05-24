import { TrendsChart } from "@/components/trends-chart";
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

  const last7Days = readings?.slice(0, 7).reverse() || [];
  const last30Days = readings?.slice(0, 30) || [];

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
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 py-4">
          <h1 className="text-xl font-semibold text-text-dark">Charts & Trends</h1>
        </div>
      </header>

      <main className="px-4 py-4 space-y-6">
        {/* Overall Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-text-dark">Overall Trend</h3>
            {getTrendIcon(stats?.trend)}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-medical-blue">
                {stats?.averageSystolic || 0}
              </p>
              <p className="text-xs text-gray-500">Average Systolic</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-medical-blue">
                {stats?.averageDiastolic || 0}
              </p>
              <p className="text-xs text-gray-500">Average Diastolic</p>
            </div>
          </div>

          {stats?.lastWeekAverage && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 text-center">
                Last week average: {stats.lastWeekAverage.systolic}/{stats.lastWeekAverage.diastolic} mmHg
              </p>
            </div>
          )}
        </div>

        {/* 7-Day Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-text-dark mb-4">7-Day Trend</h3>
          <TrendsChart data={last7Days} />
        </div>

        {/* Blood Pressure Categories */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-text-dark mb-4">BP Categories</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-800">Normal</p>
                <p className="text-sm text-green-600">Less than 120/80</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium text-yellow-800">Elevated</p>
                <p className="text-sm text-yellow-600">120-129 / Less than 80</p>
              </div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div>
                <p className="font-medium text-orange-800">Stage 1</p>
                <p className="text-sm text-orange-600">130-139 / 80-89</p>
              </div>
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <p className="font-medium text-red-800">Stage 2</p>
                <p className="text-sm text-red-600">140/90 or higher</p>
              </div>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Reading Distribution */}
        {last30Days.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-medium text-text-dark mb-4">30-Day Distribution</h3>
            
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
