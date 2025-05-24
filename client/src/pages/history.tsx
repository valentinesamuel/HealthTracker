import { Calendar, Filter, Search } from "lucide-react";
import { ReadingCard } from "@/components/reading-card";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { BloodPressureReading } from "@shared/schema";

export default function History() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: readings, isLoading } = useQuery<BloodPressureReading[]>({
    queryKey: ["/api/blood-pressure"],
  });

  const filteredReadings = readings?.filter(reading => 
    !searchTerm || 
    reading.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reading.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Reading History</h1>
          
          {/* Search and Filter */}
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notes or tags..."
                className="pl-10 h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="h-10 w-10 p-0">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-4">
        {/* Stats Summary */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-medical-blue">
                {filteredReadings.length}
              </p>
              <p className="text-xs text-gray-500">Total Readings</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-text-dark">
                {filteredReadings.length > 0 
                  ? Math.round(filteredReadings.reduce((sum, r) => sum + r.systolic, 0) / filteredReadings.length)
                  : 0
                }
              </p>
              <p className="text-xs text-gray-500">Avg Systolic</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-text-dark">
                {filteredReadings.length > 0 
                  ? Math.round(filteredReadings.reduce((sum, r) => sum + r.diastolic, 0) / filteredReadings.length)
                  : 0
                }
              </p>
              <p className="text-xs text-gray-500">Avg Diastolic</p>
            </div>
          </div>
        </div>

        {/* Readings List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : filteredReadings.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? "No readings match your search" : "No readings yet"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm ? "Try a different search term" : "Start tracking your blood pressure"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReadings.map((reading) => (
              <ReadingCard key={reading.id} reading={reading} showDate />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
