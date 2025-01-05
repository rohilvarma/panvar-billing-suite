import { PostgrestError } from '@supabase/supabase-js';

export interface Publication {
  id: number;
  user_id: string;
  name: string;
  publication_name: string;
}

export interface PublicationResponse {
  error: PostgrestError;
  data: Publication[];
  count: any;
  status: number;
  statusText: string;
}

export interface PublicationDetails {
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
