import { inject, Injectable } from '@angular/core';
import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import { from, Observable } from 'rxjs';
import { Vendor, VendorDetails } from '../../interfaces/publications';
import { PublicationTables } from '../../utils/constants';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class VendorManagementService {
  private client: SupabaseClient;
  private auth: AuthService = inject(AuthService);

  constructor() {
    this.client = this.auth.client;
  }

  /**
   * Returns an observable that emits a list of vendors associated with the current user.
   *
   * @returns An observable that emits a PostgrestSingleResponse containing an array of Vendor objects.
   *          If the user is not signed in, an empty response is returned.
   */
  public getAllVendors(): Observable<PostgrestSingleResponse<Vendor[]>> {
    return from(
      this.client
        .from(PublicationTables.PUBLICATIONS)
        .select('*')
        .eq('user_id', this.auth.userId)
    );
  }

  public addVendor(requestPayload: {
    name: string;
    publication_name: string;
    email: string;
    user_id?: string;
  }): Observable<PostgrestSingleResponse<Vendor[]>> {
    requestPayload['user_id'] = this.auth.userId ?? '';
    return from(
      this.client.from(PublicationTables.PUBLICATIONS).insert([requestPayload]).select()
    );
  }

  /**
   * Returns an observable that emits a single vendor associated with the given id.
   *
   * The user id is automatically set to the current user's id by this method. If the user is not
   * signed in, an empty response is returned.
   *
   * @param id The id of the vendor to fetch.
   * @returns An observable that emits a PostgrestSingleResponse containing the vendor.
   */
  public getVendorById(
    id: number
  ): Observable<PostgrestSingleResponse<Vendor>> {
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
   * Returns an observable that deletes a vendor associated with the given id and the current user.
   *
   * @param id The id of the vendor to delete.
   * @returns An observable that emits a PostgrestSingleResponse containing null.
   */
  public deleteVendorById(
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
   * Returns an observable that emits a list of vendor details associated with the given vendor id
   * and the current user.
   *
   * @param id The id of the vendor to fetch details for.
   * @returns An observable that emits a PostgrestSingleResponse containing an array of VendorDetails objects.
   *          If the user is not signed in, an empty response is returned.
   */
  public getVendorDetailsById(
    id: number
  ): Observable<PostgrestSingleResponse<VendorDetails[]>> {
    return from(
      this.client
        .from(PublicationTables.PUBLLICATION_DETAILS)
        .select('*')
        .eq('publication_id', id)
        .eq('user_id', this.auth.userId)
    );
  }

  public deleteVendorDetailsById(
    id: number[]
  ): Observable<PostgrestSingleResponse<null>> {
    return from(
      this.client
        .from(PublicationTables.PUBLLICATION_DETAILS)
        .delete()
        .in('id', id)
        .eq('user_id', this.auth.userId)
    );
  }

  /**
   * Returns an observable that inserts a new vendor detail with the given request payload,
   * and emits a PostgrestSingleResponse containing the newly inserted vendor detail.
   *
   * The user id is automatically set to the current user's id by this method. If the user is not
   * signed in, an empty response is returned.
   *
   * @param requestPayload The vendor detail to insert.
   * @returns An observable that emits a PostgrestSingleResponse containing the newly inserted vendor detail.
   */
  public addNewVendorDetailById(
    requestPayload: VendorDetails
  ): Observable<PostgrestSingleResponse<VendorDetails[]>> {
    requestPayload['user_id'] = this.auth.userId ?? '';
    return from(
      this.client
        .from(PublicationTables.PUBLLICATION_DETAILS)
        .insert([requestPayload])
        .select()
    );
  }
}
