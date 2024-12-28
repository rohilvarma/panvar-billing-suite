import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { AuthSession } from "@supabase/supabase-js";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { Subscription } from "rxjs";
import { AuthService } from '../../services/auth/auth.service';
import { ToastService } from "../../services/toast/toast.service";
import { Toast } from "primeng/toast";
import { toastMessages, ToastSeverity } from "../../utils/constants";

@Component({
  selector: "app-navigation",
  standalone: true,
  imports: [ButtonModule, RouterLink, Toast],
  templateUrl: "./navigation.component.html",
  styleUrl: "./navigation.component.css",
  providers: [ToastService, MessageService],
})
export class NavigationComponent implements OnInit, OnDestroy {
  public session = signal<AuthSession | null>(null);

  private router: Router = inject(Router);
  private auth: AuthService = inject(AuthService);
  private toastService: ToastService = inject(ToastService);
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
        this.toastService.addToast(
          ToastSeverity.SUCCESS,
          toastMessages.SUCCESS.TITLE.LOGOUT,
          toastMessages.SUCCESS.MESSAGE.LOGOUT
        )
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptionManager.unsubscribe();
  }
}
