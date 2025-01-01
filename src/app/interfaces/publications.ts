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

export interface VendorDetails {
  id?: number;
  invoice_date: Date;
  edited_at?: Date;
  user_id?: string;
  invoice_no: string;
  ro_no: string;
  ro_date: Date;
  amount: number;
  gst_rate: number;
  gross_amount: number;
  description: string;
  publication_id: number;
}