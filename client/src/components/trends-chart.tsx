import { BarChart3 } from "lucide-react";
import { getBPCategory } from "@/lib/blood-pressure";
import { format } from "date-fns";
import type { BloodPressureReading } from "@shared/schema";

interface TrendsChartProps {
  data?: BloodPressureReading[];
}

export function TrendsChart({ data }: TrendsChartProps) {
  const chartData = data?.slice(-7) || [];

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-text-dark">7-Day Trend</h3>
          <BarChart3 className="h-5 w-5 text-gray-400" />
        </div>
        <div className="h-32 bg-gray-50 rounded-xl flex items-center justify-center">
          <p className="text-gray-500">No data to display</p>
        </div>
      </div>
    );
  }

  const maxSystolic = Math.max(...chartData.map(r => r.systolic));
  const minSystolic = Math.min(...chartData.map(r => r.systolic));
  const systolicRange = maxSystolic - minSystolic || 20;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-text-dark">7-Day Trend</h3>
        <BarChart3 className="h-5 w-5 text-medical-blue" />
      </div>
      
      {/* Chart */}
      <div className="h-32 bg-gradient-to-t from-blue-50 to-transparent rounded-xl flex items-end justify-between px-2 py-4 relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 py-4">
          <span>{maxSystolic + 10}</span>
          <span>{Math.round((maxSystolic + minSystolic) / 2)}</span>
          <span>{Math.max(minSystolic - 10, 80)}</span>
        </div>
        
        {/* Bars */}
        <div className="flex-1 flex items-end justify-between px-6">
          {chartData.map((reading, index) => {
            const category = getBPCategory(reading.systolic, reading.diastolic);
            const height = Math.max(
              ((reading.systolic - minSystolic + 10) / (systolicRange + 20)) * 100,
              10
            );
            
            return (
              <div
                key={reading.id}
                className="flex flex-col items-center"
                style={{ width: `${100 / chartData.length}%` }}
              >
                <div
                  className={`w-4 rounded-t transition-all hover:opacity-80 ${
                    category.category === 'Normal' ? 'bg-green-500' :
                    category.category === 'Elevated' ? 'bg-yellow-500' :
                    category.category === 'Stage 1' ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ height: `${height}%` }}
                  title={`${reading.systolic}/${reading.diastolic} mmHg`}
                />
              </div>
            );
          })}
        </div>
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-gray-500 mt-2 px-6">
        {chartData.map((reading) => (
          <span key={reading.id} className="text-center">
            {format(new Date(reading.recordedAt), "EEE")}
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-4 mt-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-gray-600">Normal</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-gray-600">Elevated</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <span className="text-gray-600">Stage 1</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-gray-600">Stage 2+</span>
        </div>
      </div>
    </div>
  );
}
