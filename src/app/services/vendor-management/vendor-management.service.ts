import {inject, Injectable} from "@angular/core";
import {AuthService} from "../auth/auth.service";
import {from, Observable, of, switchMap,} from "rxjs";
import {SupabaseClient} from "@supabase/supabase-js";

@Injectable({
  providedIn: "root",
})
export class VendorManagementService {
  private client: SupabaseClient;
  private auth: AuthService = inject(AuthService);

  constructor() {
    this.client = this.auth.client;
  }

  public getAllVendors(): Observable<any> {
    return this.auth.userId$.pipe(
      switchMap(({ data: { user } }) => {
        if (user?.id) {
          return from(
            this.client.from("vendors").select("*")
          )
        } else {
          return of([]);
        }
      }),
    );
  }

  public addVendor(requestPayload: {
    name: string;
    publication_name: string;
    email: string;
    user_id?: string;
  }): Observable<any> {
    return this.auth.userId$.pipe(
      switchMap(({data: {user}}) => {
        if(user?.id) {
          requestPayload['user_id'] = user?.id
          return from(this.client.from('vendors').insert([requestPayload]));
        }
        else {
          return of(null);
        }
      })
    )
  }
}
