import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { AuthSession } from "@supabase/supabase-js";
import { ButtonModule } from "primeng/button";
import { Subscription } from "rxjs";
import { SupabaseService } from "../../services/supabase/supabase.service";

@Component({
  selector: "app-navigation",
  standalone: true,
  imports: [ButtonModule, RouterLink],
  templateUrl: "./navigation.component.html",
  styleUrl: "./navigation.component.css",
})
export class NavigationComponent implements OnInit, OnDestroy {
  public session = signal<AuthSession | null>(null);

  private _router: Router = inject(Router);
  private _supabase: SupabaseService = inject(SupabaseService);
  private _subscriptionManager: Subscription = new Subscription();
  ngOnInit(): void {
    this._supabase.session$.subscribe((session) => {
      this.session.set(session);
    });
  }

  public logout(): void {
    this._subscriptionManager.add(
      this._supabase.logout().subscribe((response) => {
        this._router.navigate(["/login"]);
      }),
    );
  }

  ngOnDestroy(): void {
    this._subscriptionManager.unsubscribe();
  }
}
