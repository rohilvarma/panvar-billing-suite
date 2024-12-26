import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { AuthSession } from "@supabase/supabase-js";
import { ButtonModule } from "primeng/button";
import { Subscription } from "rxjs";
import {AuthService} from '../../services/auth/auth.service';

@Component({
  selector: "app-navigation",
  standalone: true,
  imports: [ButtonModule, RouterLink],
  templateUrl: "./navigation.component.html",
  styleUrl: "./navigation.component.css",
})
export class NavigationComponent implements OnInit, OnDestroy {
  public session = signal<AuthSession | null>(null);

  private router: Router = inject(Router);
  private auth: AuthService = inject(AuthService);
  private subscriptionManager: Subscription = new Subscription();
  ngOnInit(): void {
    this.auth.session$.subscribe((session) => {
      this.session.set(session);
    });
  }

  public logout(): void {
    this.subscriptionManager.add(
      this.auth.logout().subscribe((response) => {
        this.router.navigate(["/login"]);
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptionManager.unsubscribe();
  }
}
