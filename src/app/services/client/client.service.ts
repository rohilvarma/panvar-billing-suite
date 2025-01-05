import { inject, Injectable } from '@angular/core';
import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from '../auth/auth.service';
import { from, Observable } from 'rxjs';
import { ClientTables } from '../../utils/constants';
import { Client, NewClient } from '../../interfaces/clients';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private client: SupabaseClient;
  private auth: AuthService = inject(AuthService);

  constructor() {
    this.client = this.auth.client;
  }

  public getAllClients(): Observable<PostgrestSingleResponse<Client[]>> {
    return from(
      this.client
        .from(ClientTables.CLIENTS)
        .select('*')
        .eq('user_id', this.auth.userId)
    );
  }

  public deleteClientById(id: number): Observable<PostgrestSingleResponse<null>> {
    return from(
      this.client
        .from(ClientTables.CLIENTS)
        .delete()
        .eq('id', id)
        .eq('user_id', this.auth.userId)
    );
  } 

  public addClient(requestPayload: NewClient): Observable<PostgrestSingleResponse<Client[]>> {
    requestPayload['user_id'] = this.auth.userId ?? '';
    return from(
      this.client
        .from(ClientTables.CLIENTS)
        .insert([requestPayload])
        .select()
    );
  }
}
