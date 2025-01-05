import { inject, Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import { from, Observable } from 'rxjs';
import { Publication, PublicationDetails } from '../../interfaces/publications';
import { PublicationTables } from '../../utils/constants';

@Injectable({
  providedIn: 'root',
})
export class PublicationService {
  private client: SupabaseClient;
  private auth: AuthService = inject(AuthService);

  constructor() {
    this.client = this.auth.client;
  }

  /**
   * Retrieves all publications associated with the current user.
   *
   * @returns An observable that emits a PostgrestSingleResponse containing an array of Publication objects.
   */
  public getAllPublications(): Observable<
    PostgrestSingleResponse<Publication[]>
  > {
    return from(
      this.client
        .from(PublicationTables.PUBLICATIONS)
        .select('*')
        .eq('user_id', this.auth.userId)
    );
  }

  /**
   * Adds a new publication to the database.
   *
   * @param requestPayload A payload with the required fields for a publication:
   *                       - name: The name of the publication.
   *                       - publication_name: The name of the publication as it appears in the publication.
   *                       - user_id: The ID of the user associated with the publication. If not provided, the current user's ID is used.
   * @returns An observable that emits a PostgrestSingleResponse containing an array of Publication objects.
   */
  public addPublication(requestPayload: {
    name: string;
    publication_name: string;
    user_id?: string;
  }): Observable<PostgrestSingleResponse<Publication[]>> {
    requestPayload['user_id'] = this.auth.userId ?? '';
    return from(
      this.client
        .from(PublicationTables.PUBLICATIONS)
        .insert([requestPayload])
        .select()
    );
  }

  /**
   * Retrieves a publication by its ID.
   *
   * @param id The ID of the publication to be retrieved.
   * @returns An observable that emits a PostgrestSingleResponse containing a Publication object, or null if the publication does not exist.
   */
  public getPublicationById(
    id: number
  ): Observable<PostgrestSingleResponse<Publication>> {
    return from(
      this.client
        .from(PublicationTables.PUBLICATIONS)
        .select('*')
        .eq('id', id)
        .eq('user_id', this.auth.userId)
        .single()
    );
  }

  /**
   * Deletes a publication by its ID.
   *
   * @param id The ID of the publication to be deleted.
   * @returns An observable that emits a PostgrestSingleResponse containing null if the deletion was successful, or an error if the deletion failed.
   */
  public deletePublicationById(
    id: number
  ): Observable<PostgrestSingleResponse<null>> {
    return from(
      this.client
        .from(PublicationTables.PUBLICATIONS)
        .delete()
        .eq('id', id)
        .eq('user_id', this.auth.userId)
    );
  }

  /**
   * Retrieves all publication details associated with a publication by its ID.
   *
   * @param id The ID of the publication.
   * @returns An observable that emits a PostgrestSingleResponse containing an array of PublicationDetails objects, or an empty array if none exist.
   */
  public getPublicationDetailsById(
    id: number
  ): Observable<PostgrestSingleResponse<PublicationDetails[]>> {
    return from(
      this.client
        .from(PublicationTables.PUBLICATION_DETAILS)
        .select('*')
        .eq('publication_id', id)
        .eq('user_id', this.auth.userId)
    );
  }

  /**
   * Deletes publication details by their IDs.
   *
   * This method removes the specified publication details from the database
   * based on their IDs. It ensures that only the details associated with the
   * current user are deleted.
   *
   * @param id An array of IDs representing the publication details to be deleted.
   * @returns An observable that emits a PostgrestSingleResponse containing null if the deletion was successful, or an error if the deletion failed.
   */
  public deletePublicationDetailsById(
    id: number[]
  ): Observable<PostgrestSingleResponse<null>> {
    return from(
      this.client
        .from(PublicationTables.PUBLICATION_DETAILS)
        .delete()
        .in('id', id)
        .eq('user_id', this.auth.userId)
    );
  }

  /**
   * Adds a new publication detail to the database.
   *
   * This method adds a new publication detail to the database with the specified
   * request payload. It ensures that only the details associated with the
   * current user are added.
   *
   * @param requestPayload The PublicationDetails object containing the details
   * of the new publication detail.
   * @returns An observable that emits a PostgrestSingleResponse containing the
   * newly added publication detail if the addition was successful, or an error
   * if the addition failed.
   */
  public addNewPublicationDetailById(
    requestPayload: PublicationDetails
  ): Observable<PostgrestSingleResponse<PublicationDetails[]>> {
    requestPayload['user_id'] = this.auth.userId ?? '';
    return from(
      this.client
        .from(PublicationTables.PUBLICATION_DETAILS)
        .insert([requestPayload])
        .select()
    );
  }
}
