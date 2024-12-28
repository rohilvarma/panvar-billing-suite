import { inject, Injectable } from '@angular/core';
import {
  PostgrestError,
  PostgrestSingleResponse,
  SupabaseClient,
  UserResponse,
} from '@supabase/supabase-js';
import { from, Observable, of, switchMap } from 'rxjs';
import { Vendor } from '../../interfaces/vendors';
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
    return this.auth.userId$.pipe(
      switchMap((userId: string | null) => {
        if (userId) {          
          return from(this.client.from('vendors').select('*').eq('user_id', userId));
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
      switchMap((userId: string | null) => {
        if (userId) {
          requestPayload['user_id'] = userId;
          return this.client.from('vendors').insert([requestPayload]).select().throwOnError();
        } else {
          return of({} as PostgrestSingleResponse<Vendor[]>);
        }
      })
    );
  }
}
