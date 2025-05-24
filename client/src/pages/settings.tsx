import { Download, Shield, Info, Moon, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTheme } from "@/components/theme-provider";
import type { BloodPressureReading } from "@shared/schema";

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const { theme, setTheme } = useTheme();
  
  const { data: readings } = useQuery<BloodPressureReading[]>({
    queryKey: ["/api/blood-pressure"],
  });

  const exportData = () => {
    if (!readings || readings.length === 0) {
      alert("No data to export");
      return;
    }

    const csvContent = [
      "Date,Time,Systolic,Diastolic,Pulse,Notes,Tags",
      ...readings.map(reading => {
        const date = new Date(reading.recordedAt);
        return [
          date.toLocaleDateString(),
          date.toLocaleTimeString(),
          reading.systolic,
          reading.diastolic,
          reading.pulse || '',
          reading.notes || '',
          reading.tags?.join(';') || ''
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bp-readings-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 py-4">
          <h1 className="text-xl font-semibold text-text-dark">Settings</h1>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        {/* App Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">App Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Reminder Notifications</p>
                  <p className="text-sm text-gray-500">Get reminded to take readings</p>
                </div>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Moon className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-gray-500">Switch to dark theme</p>
                </div>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={exportData}
              className="w-full justify-start"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data (CSV)
            </Button>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Export Info</p>
                  <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                    Export your blood pressure data as a CSV file to share with your healthcare provider.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Privacy & Security</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">Your Data is Secure</p>
                  <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                    All your health data is stored securely and is never shared with third parties.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Readings</span>
              <span className="font-medium">{readings?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">First Reading</span>
              <span className="font-medium">
                {readings && readings.length > 0 
                  ? new Date(readings[readings.length - 1].recordedAt).toLocaleDateString()
                  : 'None yet'
                }
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Medical Disclaimer</p>
              <p className="text-sm text-yellow-600 mt-1">
                This app is for tracking purposes only. Always consult with healthcare professionals 
                for medical advice and treatment decisions.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
