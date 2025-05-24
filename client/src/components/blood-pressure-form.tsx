import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertBloodPressureReadingSchema } from "@shared/schema";
import { getBPCategory } from "@/lib/blood-pressure";
import type { InsertBloodPressureReading } from "@shared/schema";

const quickTags = [
  { label: "Before Medication", value: "before-medication", icon: "💊" },
  { label: "After Exercise", value: "after-exercise", icon: "🏃" },
  { label: "Morning", value: "morning", icon: "🌅" },
  { label: "Evening", value: "evening", icon: "🌙" },
];

export function BloodPressureForm() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertBloodPressureReading>({
    resolver: zodResolver(insertBloodPressureReadingSchema),
    defaultValues: {
      systolic: undefined,
      diastolic: undefined,
      pulse: undefined,
      notes: "",
      tags: [],
    },
  });

  const createReadingMutation = useMutation({
    mutationFn: async (data: InsertBloodPressureReading) => {
      const response = await apiRequest("POST", "/api/blood-pressure", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blood-pressure"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blood-pressure/latest"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blood-pressure/stats"] });
      
      form.reset();
      setSelectedTags([]);
      
      toast({
        title: "Reading saved successfully",
        description: "Your blood pressure reading has been recorded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error saving reading",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertBloodPressureReading) => {
    // Validate systolic > diastolic
    if (data.systolic <= data.diastolic) {
      toast({
        title: "Invalid reading",
        description: "Systolic must be higher than diastolic.",
        variant: "destructive",
      });
      return;
    }

    const submissionData = {
      ...data,
      tags: selectedTags,
    };

    createReadingMutation.mutate(submissionData);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const systolic = form.watch("systolic");
  const diastolic = form.watch("diastolic");
  const category = systolic && diastolic ? getBPCategory(systolic, diastolic) : null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-medium text-text-dark mb-4 flex items-center">
        <Plus className="text-medical-blue mr-2 h-5 w-5" />
        Add Reading
      </h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* BP Input Row */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="systolic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Systolic</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="120"
                        className="text-xl font-semibold text-center pr-16 touch-target"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                        mmHg
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="diastolic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diastolic</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="80"
                        className="text-xl font-semibold text-center pr-16 touch-target"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                        mmHg
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Category Preview */}
          {category && (
            <div className="text-center">
              <span className={`px-3 py-1 text-sm rounded-full ${category.bgColor} ${category.textColor}`}>
                {category.category}
              </span>
            </div>
          )}

          {/* Pulse Input */}
          <FormField
            control={form.control}
            name="pulse"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pulse (Optional)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder="72"
                      className="pr-12 touch-target"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                      bpm
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes Input */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Before medication, after exercise..."
                    className="touch-target"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Quick Tags */}
          <div>
            <FormLabel>Quick Tags</FormLabel>
            <div className="flex flex-wrap gap-2 mt-2">
              {quickTags.map((tag) => (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() => toggleTag(tag.value)}
                  className={`px-3 py-2 text-sm rounded-full touch-target transition-colors ${
                    selectedTags.includes(tag.value)
                      ? "bg-medical-blue text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="mr-1">{tag.icon}</span>
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full py-4 touch-target"
            disabled={createReadingMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {createReadingMutation.isPending ? "Saving..." : "Save Reading"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
