import { inject, Injectable } from '@angular/core';
import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from '../auth/auth.service';
import { from, Observable } from 'rxjs';
import { ClientTables } from '../../utils/constants';
import { Client, ClientDetails, NewClient } from '../../interfaces/clients';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private client: SupabaseClient;
  private auth: AuthService = inject(AuthService);

  constructor() {
    this.client = this.auth.client;
  }

  /**
   * Retrieves all clients associated with the current user.
   *
   * @returns An observable that emits a PostgrestSingleResponse containing an array of Client objects.
   */
  public getAllClients(): Observable<PostgrestSingleResponse<Client[]>> {
    return from(
      this.client
        .from(ClientTables.CLIENTS)
        .select('*')
        .eq('user_id', this.auth.userId)
    );
  }

  /**
   * Retrieves a client by its ID.
   *
   * This method fetches the client data from the database for the given client ID,
   * ensuring that the client is associated with the current user.
   *
   * @param id The ID of the client to be retrieved.
   * @returns An observable that emits a PostgrestSingleResponse containing a Client object,
   * or null if the client does not exist.
   */
  public getClientById(
    id: number
  ): Observable<PostgrestSingleResponse<Client>> {
    return from(
      this.client
        .from(ClientTables.CLIENTS)
        .select('*')
        .eq('id', id)
        .eq('user_id', this.auth.userId)
        .single()
    );
  }

  /**
   * Deletes a client by its ID.
   *
   * This method removes the specified client from the database
   * based on their ID. It ensures that only the client associated
   * with the current user is deleted.
   *
   * @param id The ID of the client to be deleted.
   * @returns An observable that emits a PostgrestSingleResponse containing null if the deletion was successful, or an error if the deletion failed.
   */

  public deleteClientById(
    id: number
  ): Observable<PostgrestSingleResponse<null>> {
    return from(
      this.client
        .from(ClientTables.CLIENTS)
        .delete()
        .eq('id', id)
        .eq('user_id', this.auth.userId)
    );
  }

  /**
   * Adds a new client to the database.
   *
   * This method adds a new client to the database with the specified
   * request payload. It ensures that only the details associated with the
   * current user are added.
   *
   * @param requestPayload The NewClient object containing the details
   * of the new client.
   * @returns An observable that emits a PostgrestSingleResponse containing the
   * newly added client if the addition was successful, or an error
   * if the addition failed.
   */
  public addClient(
    requestPayload: NewClient
  ): Observable<PostgrestSingleResponse<Client[]>> {
    requestPayload['user_id'] = this.auth.userId ?? '';
    return from(
      this.client.from(ClientTables.CLIENTS).insert([requestPayload]).select()
    );
  }

  /**
   * Retrieves all client details associated with a client by its ID.
   *
   * @param id The ID of the client.
   * @returns An observable that emits a PostgrestSingleResponse containing an array of ClientDetails objects, or an empty array if none exist.
   */
  public getClientDetailsById(
    id: number
  ): Observable<PostgrestSingleResponse<ClientDetails[]>> {
    return from(
      this.client
        .from(ClientTables.CLIENT_DETAILS)
        .select('*')
        .eq('client_id', id)
        .eq('user_id', this.auth.userId)
    );
  }

  /**
   * Deletes client details by their IDs.
   *
   * This method removes the specified client details from the database
   * based on their IDs. It ensures that only the details associated with the
   * current user are deleted.
   *
   * @param id An array of IDs representing the client details to be deleted.
   * @returns An observable that emits a PostgrestSingleResponse containing null if the deletion was successful, or an error if the deletion failed.
   */
  public deleteClientDetailsById(
    id: number[]
  ): Observable<PostgrestSingleResponse<null>> {
    return from(
      this.client
        .from(ClientTables.CLIENT_DETAILS)
        .delete()
        .in('id', id)
        .eq('user_id', this.auth.userId)
    );
  }

  /**
   * Adds a new client invoice to the database.
   *
   * This method inserts a new client invoice record into the database using the provided
   * request payload. The user ID is automatically set to the current user's ID to ensure
   * the invoice is associated with the correct user.
   *
   * @param requestPayload The ClientDetails object containing the details of the new invoice.
   * @returns An observable that emits a PostgrestSingleResponse containing the newly added
   * client invoice details if the addition was successful, or an error if the addition failed.
   */
  public addClientInvoiceById(
    requestPayload: ClientDetails
  ): Observable<PostgrestSingleResponse<ClientDetails[]>> {
    requestPayload['user_id'] = this.auth.userId ?? '';
    return from(
      this.client
        .from(ClientTables.CLIENT_DETAILS)
        .insert([requestPayload])
        .select()
    );
  }
}
