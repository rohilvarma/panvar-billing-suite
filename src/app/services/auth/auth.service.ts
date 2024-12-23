import { Injectable } from '@angular/core';
import {BehaviorSubject, from, Observable} from 'rxjs';
import {
  AuthChangeEvent, AuthError,
  AuthResponse,
  AuthSession,
  AuthTokenResponsePassword,
  createClient,
  Session,
  SupabaseClient
} from '@supabase/supabase-js';
import {environments} from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public _session = new BehaviorSubject<AuthSession | null>(
    JSON.parse(localStorage.getItem("supabase.auth.token") || "null"),
  );
  private _supabase: SupabaseClient;

  constructor() {
    this._supabase = createClient(
      environments.supabaseUrl,
      environments.supabaseKey,
      {
        auth: {
          persistSession: true, // Ensures session is saved across browser reloads
          autoRefreshToken: true, // Automatically refreshes session tokens
          storageKey: "supabase.auth.token",
          storage: window.localStorage,
        },
      },
    );

    this.initSession();
  }

  private async initSession() {
    let initialSession = null;
    try {
      const {
        data: { session },
      } = await this._supabase.auth.getSession();
      initialSession = session;

      this._supabase.auth.onAuthStateChange((event, session) => {
        this._session.next(session);
      });
    } catch (error) {
      console.error("Error initializing session:", error);
      this._session.next(null);
    } finally {
      this._session.next(initialSession);
    }
  }

  get session$() {
    return this._session.asObservable();
  }

  onAuthChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void,
  ) {
    return this._supabase.auth.onAuthStateChange(callback);
  }

  public signup(email: string, password: string): Observable<AuthResponse> {
    return from(
      this._supabase.auth.signUp({ email, password }),
    ) as Observable<AuthResponse>;
  }

  public login(
    email: string,
    password: string,
  ): Observable<AuthTokenResponsePassword> {
    return from(
      this._supabase.auth.signInWithPassword({ email, password }),
    ) as Observable<AuthTokenResponsePassword>;
  }

  public logout(): Observable<{ error: AuthError | null }> {
    return from(this._supabase.auth.signOut()) as Observable<{
      error: AuthError | null;
    }>;
  }
}
