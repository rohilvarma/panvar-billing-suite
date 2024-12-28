import { Injectable } from '@angular/core';
import {
  AuthChangeEvent,
  AuthError,
  AuthResponse,
  AuthSession,
  AuthTokenResponsePassword,
  createClient,
  Session,
  SupabaseClient
} from '@supabase/supabase-js';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { environments } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private session = new BehaviorSubject<AuthSession | null>(
    JSON.parse(localStorage.getItem("supabase.auth.token") || "null"),
  );
  private userId = new BehaviorSubject<string | null>(null);
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
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

  /**
   * Initializes the authentication session by retrieving the current session from Supabase.
   * If successful, sets up an event listener for changes in the authentication state.
   *
   * @returns A Promise that resolves when the session is initialized.
   */
  private async initSession(): Promise<void> {
    let initialSession = null;
    try {
      const {
        data: {session},
      } = await this.supabase.auth.getSession();
      initialSession = session;

      this.userId.next(session?.user?.id ?? null);

      this.supabase.auth.onAuthStateChange((event, session) => {
        this.session.next(session);
      });
    } catch (error) {
      console.error("Error initializing session:", error);
      this.session.next(null);
    } finally {
      this.session.next(initialSession);
    }
  }

  /**
   * Returns an observable representing the current authentication session.
   *
   * @returns An Observable that emits the current AuthSession or null if no session is active.
   */
  get session$(): Observable<AuthSession | null> {
    return this.session.asObservable();
  }
  
  get userId$(): Observable<string | null> {
    return this.userId.asObservable();
  }

  get client(): SupabaseClient {
    return this.supabase
  }

  /**
   * Listens for changes in the authentication state and calls the given callback function whenever the state changes.
   *
   * @param callback A function that will be called whenever the authentication state changes.
   *                 The function takes two parameters: `event`, which is an `AuthChangeEvent` enum value
   *                 indicating the type of event that occurred, and `session`, which is the current session
   *                 or `null` if the user is not signed in.
   *
   * @returns The subscription for the given callback. You can use the `unsubscribe()` method of the subscription
   *          to stop listening to authentication state changes.
   */
  onAuthChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void,
  ) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  public signup(email: string, password: string): Observable<AuthResponse> {
    return from(
      this.supabase.auth.signUp({email, password}),
    ) as Observable<AuthResponse>;
  }

  /**
   * Signs in the user with the given email and password.
   *
   * @param email The email address of the user to sign in.
   * @param password The password for the user to sign in.
   *
   * @returns An Observable that emits an object with a single property,
   *          `access_token`, which is the access token for the signed in user.
   */
  public login(
    email: string,
    password: string,
  ): Observable<AuthTokenResponsePassword> {
    return from(
      this.supabase.auth.signInWithPassword({email, password}),
    ) as Observable<AuthTokenResponsePassword>;
  }

  /**
   * Signs out the current user.
   *
   * @returns An Observable that resolves when the sign out is complete. The
   *          Observable emits an object with a single property, `error`, which
   *          is `null` if the sign out was successful or an `AuthError` object
   *          if the sign out failed.
   */
  public logout(): Observable<{ error: AuthError | null }> {
    return from(this.supabase.auth.signOut()) as Observable<{
      error: AuthError | null;
    }>;
  }
}
