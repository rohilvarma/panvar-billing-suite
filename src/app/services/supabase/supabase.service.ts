import { Injectable } from "@angular/core";
import {
  AuthChangeEvent,
  AuthError,
  AuthResponse,
  AuthSession,
  AuthTokenResponsePassword,
  createClient,
  Session,
  SupabaseClient,
} from "@supabase/supabase-js";
import { BehaviorSubject, from, Observable } from "rxjs";
import { environments } from "../../../environments/environments";

@Injectable({
  providedIn: "root",
})
export class SupabaseService {
  public _session = new BehaviorSubject<AuthSession | null>(null);
  private _supabase: SupabaseClient;

  constructor() {
    this._supabase = createClient(
      environments.supabaseUrl,
      environments.supabaseKey,
      {
        auth: {
          persistSession: true, // Ensures session is saved across browser reloads
          autoRefreshToken: true, // Automatically refreshes session tokens
        },
      },
    );

    this._supabase.auth.getSession().then(({ data }) => {
      this._session.next(data.session);
    });

    this._supabase.auth.onAuthStateChange((event, session) => {
      this._session.next(session); // Update session when it changes
    });
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
