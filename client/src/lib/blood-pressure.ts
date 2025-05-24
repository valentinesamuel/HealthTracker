export interface BPCategory {
  category: string;
  bgColor: string;
  textColor: string;
  color: string;
}

export function getBPCategory(systolic: number, diastolic: number): BPCategory {
  if (systolic < 120 && diastolic < 80) {
    return {
      category: 'Normal',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      color: 'green'
    };
  }
  
  if (systolic >= 120 && systolic < 130 && diastolic < 80) {
    return {
      category: 'Elevated',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      color: 'yellow'
    };
  }
  
  if ((systolic >= 130 && systolic < 140) || (diastolic >= 80 && diastolic < 90)) {
    return {
      category: 'Stage 1',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
      color: 'orange'
    };
  }
  
  if (systolic >= 140 || diastolic >= 90) {
    return {
      category: 'Stage 2',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      color: 'red'
    };
  }
  
  if (systolic >= 180 || diastolic >= 120) {
    return {
      category: 'Crisis',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      color: 'red'
    };
  }
  
  return {
    category: 'Unknown',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    color: 'gray'
  };
}

export function validateBPReading(systolic: number, diastolic: number): string | null {
  if (systolic < 70 || systolic > 250) {
    return 'Systolic reading seems unusual (70-250 range expected)';
  }
  
  if (diastolic < 40 || diastolic > 150) {
    return 'Diastolic reading seems unusual (40-150 range expected)';
  }
  
  if (systolic <= diastolic) {
    return 'Systolic should be higher than diastolic';
  }
  
  return null;
}
