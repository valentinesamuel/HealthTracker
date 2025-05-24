import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, Play, Pause } from "lucide-react";
import { format, subDays } from "date-fns";
import { getBPCategory } from "@/lib/blood-pressure";
import type { BloodPressureReading } from "@shared/schema";

interface AnimatedTrendVisualizerProps {
  data: BloodPressureReading[];
  height?: number;
}

export function AnimatedTrendVisualizer({ data, height = 200 }: AnimatedTrendVisualizerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Get last 30 days of data
  const chartData = data?.slice(-30) || [];

  // Calculate chart bounds - handle empty data
  const maxSystolic = chartData.length > 0 ? Math.max(...chartData.map(r => r.systolic)) : 120;
  const minSystolic = chartData.length > 0 ? Math.min(...chartData.map(r => r.systolic)) : 120;
  const maxDiastolic = chartData.length > 0 ? Math.max(...chartData.map(r => r.diastolic)) : 80;
  const minDiastolic = chartData.length > 0 ? Math.min(...chartData.map(r => r.diastolic)) : 80;
  
  const yMax = Math.max(maxSystolic + 10, 180);
  const yMin = Math.max(minDiastolic - 10, 60);
  const yRange = yMax - yMin;

  const getY = (value: number) => {
    return height - ((value - yMin) / yRange) * height;
  };

  const getX = (index: number) => {
    if (chartData.length <= 1) return 50;
    return (index / (chartData.length - 1)) * 100;
  };

  // Create SVG path for systolic line
  const systolicPath = chartData
    .map((reading, index) => {
      const x = getX(index);
      const y = getY(reading.systolic);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Create SVG path for diastolic line
  const diastolicPath = chartData
    .map((reading, index) => {
      const x = getX(index);
      const y = getY(reading.diastolic);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Auto-play on load
  useEffect(() => {
    if (chartData.length > 0 && !hasAutoPlayed) {
      setHasAutoPlayed(true);
      setIsPlaying(true);
    }
  }, [chartData.length, hasAutoPlayed]);

  // Animation controls
  useEffect(() => {
    if (isPlaying && chartData.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= chartData.length - 1) {
            setIsPlaying(false);
            return chartData.length - 1;
          }
          return prev + 1;
        });
      }, 800);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, chartData.length]);

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setCurrentIndex(0);
    }
  };

  const currentReading = chartData[selectedPoint ?? currentIndex];
  const category = currentReading ? getBPCategory(currentReading.systolic, currentReading.diastolic) : null;

  // Calculate trend
  const getTrend = () => {
    if (chartData.length < 2) return null;
    const recent = chartData.slice(-5);
    const older = chartData.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, r) => sum + r.systolic, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, r) => sum + r.systolic, 0) / older.length : recentAvg;
    
    if (recentAvg > olderAvg + 2) return 'increasing';
    if (recentAvg < olderAvg - 2) return 'decreasing';
    return 'stable';
  };

  const trend = getTrend();

  // Show empty state if no data
  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Animated Trend Visualizer</h3>
          <Activity className="h-5 w-5 text-medical-blue" />
        </div>
        <div className="h-48 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">No data to visualize</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Animated Trend Visualizer</h3>
        <div className="flex items-center space-x-2">
          {trend === 'increasing' && <TrendingUp className="h-5 w-5 text-red-500" />}
          {trend === 'decreasing' && <TrendingDown className="h-5 w-5 text-green-500" />}
          {trend === 'stable' && <Activity className="h-5 w-5 text-blue-500" />}
          <button
            onClick={toggleAnimation}
            className="p-2 rounded-lg bg-medical-blue text-white hover:bg-blue-600 transition-colors"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Current Reading Display - Only show when point is selected */}
      <AnimatePresence mode="wait">
        {currentReading && selectedPoint !== null && (
          <motion.div
            key={selectedPoint}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {format(new Date(currentReading.recordedAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-2xl font-bold text-medical-blue">
                    {currentReading.systolic}
                  </span>
                  <span className="text-lg text-gray-400">/</span>
                  <span className="text-2xl font-bold text-medical-blue">
                    {currentReading.diastolic}
                  </span>
                  <span className="text-sm text-gray-500">mmHg</span>
                </div>
              </div>
              {category && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`px-3 py-1 text-sm rounded-full ${category.bgColor} ${category.textColor}`}
                >
                  {category.category}
                </motion.span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chart Area */}
      <div className="relative" style={{ height: `${height}px` }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 100 ${height}`}
          className="overflow-visible"
        >
          {/* Grid lines */}
          {chartData.length > 0 && [...Array(5)].map((_, i) => {
            const y = (i / 4) * height;
            const value = Math.round(yMax - (i / 4) * yRange);
            return (
              <g key={i}>
                <line
                  x1="0"
                  y1={y}
                  x2="100"
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="0.1"
                  className="text-gray-200 dark:text-gray-700"
                  strokeDasharray="0.5 0.5"
                />
                <text
                  x="-2"
                  y={y + 1}
                  textAnchor="end"
                  className="text-xs fill-gray-400 dark:fill-gray-500"
                  fontSize="3"
                >
                  {isNaN(value) ? 0 : value}
                </text>
              </g>
            );
          })}

          {/* Animated Systolic Line */}
          <motion.path
            d={systolicPath}
            fill="none"
            stroke="#2196F3"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: isPlaying ? (currentIndex + 1) / chartData.length : 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />

          {/* Animated Diastolic Line */}
          <motion.path
            d={diastolicPath}
            fill="none"
            stroke="#4CAF50"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: isPlaying ? (currentIndex + 1) / chartData.length : 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />

          {/* Data Points */}
          {chartData.map((reading, index) => {
            const x = getX(index);
            const systolicY = getY(reading.systolic);
            const diastolicY = getY(reading.diastolic);
            const isVisible = !isPlaying || index <= currentIndex;
            const category = getBPCategory(reading.systolic, reading.diastolic);
            
            return (
              <g key={reading.id}>
                {/* Systolic Point */}
                <motion.circle
                  cx={x}
                  cy={systolicY}
                  r={selectedPoint === index ? "1.5" : "1"}
                  fill="#2196F3"
                  stroke="white"
                  strokeWidth="0.3"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: isVisible ? 1 : 0, 
                    opacity: isVisible ? 1 : 0 
                  }}
                  transition={{ delay: isPlaying ? index * 0.1 : 0 }}
                  className="cursor-pointer"
                  onClick={() => setSelectedPoint(selectedPoint === index ? null : index)}
                />
                
                {/* Diastolic Point */}
                <motion.circle
                  cx={x}
                  cy={diastolicY}
                  r={selectedPoint === index ? "1.5" : "1"}
                  fill="#4CAF50"
                  stroke="white"
                  strokeWidth="0.3"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: isVisible ? 1 : 0, 
                    opacity: isVisible ? 1 : 0 
                  }}
                  transition={{ delay: isPlaying ? index * 0.1 : 0 }}
                  className="cursor-pointer"
                  onClick={() => setSelectedPoint(selectedPoint === index ? null : index)}
                />

                {/* Category Indicator */}
                {isVisible && (
                  <motion.rect
                    x={x - 0.5}
                    y={height + 2}
                    width="1"
                    height="2"
                    fill={category.color}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: isPlaying ? index * 0.1 : 0 }}
                  />
                )}
              </g>
            );
          })}
        </svg>


      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-0.5 bg-blue-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Systolic</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-0.5 bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Diastolic</span>
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {chartData.length} readings • Last 30 days
        </div>
      </div>
    </div>
  );
}