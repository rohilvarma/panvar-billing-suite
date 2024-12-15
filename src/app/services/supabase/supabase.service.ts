import { Injectable } from '@angular/core';
import {
  AuthChangeEvent,
  AuthResponse,
  createClient,
  Session,
  SupabaseClient,
  UserResponse,
} from '@supabase/supabase-js';
import { from, Observable } from 'rxjs';
import { environments } from '../../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environments.supabaseUrl,
      environments.supabaseKey
    );
  }

  onAuthChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  public isAuthenticated(): Observable<UserResponse> {
    return from(this.supabase.auth.getUser()) as Observable<UserResponse>;
  }

  public signup(email: string, password: string): Observable<AuthResponse> {
    return from(
      this.supabase.auth.signUp({ email, password })
    ) as Observable<AuthResponse>;
  }
}
