import { Trash2, Clock } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSwipe } from "@/hooks/use-swipe";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getBPCategory } from "@/lib/blood-pressure";
import { formatDistanceToNow, format } from "date-fns";
import type { BloodPressureReading } from "@shared/schema";

interface ReadingCardProps {
  reading: BloodPressureReading;
  showDate?: boolean;
}

export function ReadingCard({ reading, showDate = false }: ReadingCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const category = getBPCategory(reading.systolic, reading.diastolic);

  const deleteReadingMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/blood-pressure/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blood-pressure"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blood-pressure/latest"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blood-pressure/stats"] });
      
      toast({
        title: "Reading deleted",
        description: "The blood pressure reading has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting reading",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => deleteReadingMutation.mutate(reading.id),
    threshold: 100,
  });

  const handleDelete = () => {
    deleteReadingMutation.mutate(reading.id);
  };

  const recordedDate = new Date(reading.recordedAt);

  return (
    <div
      {...swipeHandlers}
      className="reading-card bg-white rounded-xl p-4 shadow-sm touch-target transition-transform"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className="text-lg font-bold text-text-dark">
              {reading.systolic}/{reading.diastolic}
              <span className="text-sm text-gray-500 font-normal ml-1">mmHg</span>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${category.bgColor} ${category.textColor}`}>
              {category.category}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>
                {showDate 
                  ? format(recordedDate, "MMM d, yyyy 'at' h:mm a")
                  : formatDistanceToNow(recordedDate, { addSuffix: true })
                }
              </span>
            </div>
            {reading.pulse && (
              <span>💓 {reading.pulse} bpm</span>
            )}
          </div>
          
          {reading.notes && (
            <p className="text-sm text-gray-600 mt-1">{reading.notes}</p>
          )}
          
          {reading.tags && reading.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {reading.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={handleDelete}
          disabled={deleteReadingMutation.isPending}
          className="touch-target text-gray-400 hover:text-red-500 transition-colors p-2"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
