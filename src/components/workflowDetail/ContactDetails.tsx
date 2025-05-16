
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Download } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  consentStatus: "Opted In" | "Pending" | "Opted Out";
}

interface ContactDetailsProps {
  fileName: string;
  contactCount: number;
  uploadDate: string;
  contacts: Contact[];
  isLargeFile: boolean;
}

const ContactDetails = ({
  fileName,
  contactCount,
  uploadDate,
  contacts,
  isLargeFile
}: ContactDetailsProps) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h3 className="text-lg font-semibold">{fileName}</h3>
          <p className="text-gray-500 text-sm">Uploaded on {uploadDate}</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <p className="text-sm mr-2"><strong>{contactCount.toLocaleString()}</strong> contacts</p>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Download
          </Button>
        </div>
      </div>

      {isLargeFile ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-600 mb-4">
            This file contains more than 100 contacts and is optimized for performance.
          </p>
          <p className="text-gray-600 mb-6">
            <strong>{contactCount.toLocaleString()}</strong> contacts in total with <strong>
              {contacts.filter(c => c.consentStatus === "Opted In").length}
            </strong> opted in.
          </p>
          <Button>
            <Download className="h-4 w-4 mr-2" /> Download Full Contact List
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  onClick={() => handleSort("name")}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    Name {getSortIcon("name")}
                  </div>
                </TableHead>
                <TableHead 
                  onClick={() => handleSort("email")}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    Email {getSortIcon("email")}
                  </div>
                </TableHead>
                <TableHead 
                  onClick={() => handleSort("phone")}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    Phone {getSortIcon("phone")}
                  </div>
                </TableHead>
                <TableHead 
                  onClick={() => handleSort("consentStatus")}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    Consent Status {getSortIcon("consentStatus")}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.phone}</TableCell>
                  <TableCell>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      contact.consentStatus === "Opted In"
                        ? "bg-green-100 text-green-800"
                        : contact.consentStatus === "Opted Out"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {contact.consentStatus}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ContactDetails;
