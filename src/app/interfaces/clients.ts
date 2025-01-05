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
