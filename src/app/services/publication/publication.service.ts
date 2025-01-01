import { inject, Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import { from, Observable } from 'rxjs';
import { Publication, PublicationDetails } from '../../interfaces/publications';
import { PublicationTables } from '../../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class PublicationService {
private client: SupabaseClient;
  private auth: AuthService = inject(AuthService);

  constructor() {
    this.client = this.auth.client;
  }


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

  public addPublication(requestPayload: {
    name: string;
    publication_name: string;
    email: string;
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
