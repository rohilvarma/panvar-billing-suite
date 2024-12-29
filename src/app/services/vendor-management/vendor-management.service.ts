import { inject, Injectable } from '@angular/core';
import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import { from, Observable, of, switchMap, take } from 'rxjs';
import { Vendor, VendorDetails } from '../../interfaces/vendors';
import { AuthService } from '../auth/auth.service';
import { VendorTables } from '../../utils/constants';

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
    return this.auth.userId$.pipe(
      take(1),
      switchMap((userId: string | null) => {
        if (userId) {
          return from(
            this.client.from(VendorTables.VENDORS).select('*').eq('user_id', userId)
          );
        } else {
          return of({} as PostgrestSingleResponse<Vendor[]>);
        }
      })
    );
  }

  public addVendor(requestPayload: {
    name: string;
    publication_name: string;
    email: string;
    user_id?: string;
  }): Observable<PostgrestSingleResponse<Vendor[]>> {
    return this.auth.userId$.pipe(
      take(1),
      switchMap((userId: string | null) => {
        if (userId) {
          requestPayload['user_id'] = userId;
          return this.client.from(VendorTables.VENDORS).insert([requestPayload]).select();
        } else {
          return of({} as PostgrestSingleResponse<Vendor[]>);
        }
      })
    );
  }

  public getVendorById(
    id: number
  ): Observable<PostgrestSingleResponse<Vendor>> {
    return this.auth.userId$.pipe(
      take(1),
      switchMap((userId: string | null) => {
        if (userId) {
          return from(
            this.client
              .from(VendorTables.VENDORS)
              .select('*')
              .eq('id', id)
              .eq('user_id', userId)
              .single()
          );
        } else {
          return of({} as PostgrestSingleResponse<Vendor>);
        }
      })
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
  public getVendorDetailsById(id: number): Observable<PostgrestSingleResponse<VendorDetails[]>> {
    return this.auth.userId$.pipe(
      take(1),
      switchMap((userId: string | null) => {
        if (userId) {
          return from(
            this.client
              .from(VendorTables.VENDOR_DETAILS)
              .select('*')
              .eq('vendor_id', id)
              .eq('user_id', userId)
          );
        } else {
          return of({} as PostgrestSingleResponse<VendorDetails[]>);
        }
      })
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
  public addNewVendorDetailById(requestPayload: VendorDetails): Observable<PostgrestSingleResponse<VendorDetails[]>> {
    return this.auth.userId$.pipe(
      take(1),
      switchMap((userId: string | null) => {
        if (userId) {
          requestPayload['user_id'] = userId;
          return this.client.from(VendorTables.VENDOR_DETAILS).insert([requestPayload]).select();
        } else {
          return of({} as PostgrestSingleResponse<VendorDetails[]>);
        }
      })
    )
  }
}
