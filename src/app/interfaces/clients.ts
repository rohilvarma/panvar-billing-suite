export interface Client {
  id: number;
  user_id: string;
  client_name: string;
  email: string;
}

export interface NewClient {
  client_name: string;
  user_id?: string;
}

export interface ClientDetails {
  id?: number;
  user_id?: string;
  invoice_date: Date;
  invoice_no: string;
  amount: number;
  gst_rate: number;
  gross_amount: number;
  client_id: number;
}
