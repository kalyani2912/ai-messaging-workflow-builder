
import Papa from 'papaparse';
import { toast } from '@/hooks/use-toast';

export interface CSVData {
  filename: string;
  total_contacts: number;
  with_consent: number;
  without_consent: number;
  raw_data?: any[];
}

export const parseCSV = (file: File): Promise<CSVData> => {
  return new Promise((resolve, reject) => {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a CSV file smaller than 10MB.",
        variant: "destructive",
      });
      reject(new Error("File too large. Maximum size is 10MB."));
      return;
    }

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        // Check if required columns exist
        const headers = results.meta.fields || [];
        const requiredColumns = ['Name', 'Phone'];
        
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        
        if (missingColumns.length > 0) {
          toast({
            title: "Invalid CSV format",
            description: `Missing required columns: ${missingColumns.join(", ")}`,
            variant: "destructive",
          });
          reject(new Error(`Invalid CSV format. Missing columns: ${missingColumns.join(", ")}`));
          return;
        }
        
        // Count contacts with and without consent
        const data = results.data as any[];
        let withConsent = 0;
        let withoutConsent = 0;
        
        data.forEach(row => {
          // Check any consent column
          const hasConsent = row['Opt-in SMS'] === 'Yes' || 
                            row['Opt-in WhatsApp'] === 'Yes' || 
                            row['Opt-in Email'] === 'Yes' ||
                            row.Consent === 'Yes' ||
                            row.Consent === true ||
                            row.Consent === 1;
          
          if (hasConsent) {
            withConsent++;
          } else {
            withoutConsent++;
          }
        });
        
        resolve({
          filename: file.name,
          total_contacts: data.length,
          with_consent: withConsent,
          without_consent: withoutConsent,
          raw_data: data
        });
      },
      error: (error) => {
        toast({
          title: "CSV parsing error",
          description: error.message,
          variant: "destructive",
        });
        reject(error);
      }
    });
  });
};

// Generate a sample CSV string for appointment reminders
export const generateSampleCSV = (): string => {
  return `Name,Phone,Preferred Channel,Opt-in SMS,Opt-in WhatsApp,Opt-in Email,Appointment Type,Appointment Date & Time,Notes
John Doe,+15551234567,SMS,Yes,No,Yes,Dental Checkup,2023-06-15 10:00:00,First time patient
Jane Smith,+15557654321,WhatsApp,Yes,Yes,Yes,Haircut,2023-06-16 14:30:00,Prefers stylist Mark
Robert Johnson,+15559876543,Email,Yes,No,Yes,Medical Consultation,2023-06-17 09:15:00,Annual checkup
Emily Williams,+15551112222,SMS,Yes,No,No,Car Service,2023-06-18 13:45:00,Oil change
`;
};
