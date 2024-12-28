import {PostgrestError} from '@supabase/supabase-js';

export interface Vendor {
  id: number;
  created_at: Date;
  user_id: string;
  name: string;
  email: string;
  publication_name: string;
}

export interface VendorResponse {
  error: PostgrestError
  data: Vendor[];
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
