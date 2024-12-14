export interface IVendor {
  id: string;
  name: string;
  publicationName: string;
  contactPerson: string;
  email: string;
}

export interface IVendorDetails {
  invoiceNo: string;
  date: Date;
  RONumber: string;
  RODate: Date;
  amount: number;
  description: string;
}
