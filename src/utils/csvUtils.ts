
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
        const requiredColumns = ['Name', 'Phone', 'Email', 'Consent'];
        
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
          if (row.Consent && (row.Consent.toLowerCase() === 'yes' || row.Consent === true || row.Consent === 1)) {
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
