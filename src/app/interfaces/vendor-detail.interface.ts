export interface IVendor {
  id: number;
  created_at: Date;
  user_id: string;
  name: string;
  email: string;
  publication_name: string;
}

export interface IVendorResponse {
  error: {
    code: string;
    message: string;
  };
  data: IVendor[];
  count: any;
  status: number;
  statusText: string;
}

export interface IVendorDetails {
  invoiceNo: string;
  date: Date;
  RONumber: string;
  RODate: Date;
  amount: number;
  description: string;
}

export interface NewVendor {
  name: string;
  publication_name: string;
  email: string;
  user_id?: string;
}
