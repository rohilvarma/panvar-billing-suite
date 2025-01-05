import { Routes } from "@angular/router";
import { AuthGuard } from "./utils/guards/auth/auth.guard";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./components/dashboard/dashboard.component").then(
        (c) => c.DashboardComponent,
      ),
    title: "Panvar Billing Suite",
    canActivate: [AuthGuard],
  },
  {
    path: "publication/:id",
    loadComponent: () =>
      import("./components/publication-details/publication-details.component").then(
        (c) => c.PublicationDetailsComponent,
      ),
    title: "Publications",
    canActivate: [AuthGuard],
  },
  {
    path: "client/:id",
    loadComponent: () =>
      import("./components/client-details/client-details.component").then(
        (c) => c.ClientDetailsComponent,
      ),
    title: "Clients",
    canActivate: [AuthGuard],
  },
  {
    path: "login",
    loadComponent: () =>
      import("./components/login/login.component").then(
        (m) => m.LoginComponent,
      ),
    title: "Log in",
  },
  {
    path: "signup",
    loadComponent: () =>
      import("./components/sign-up/sign-up.component").then(
        (c) => c.SignUpComponent,
      ),
    title: "Sign up",
  },
  {
    path: "not-found",
    loadComponent: () =>
      import("./components/not-found/not-found.component").then(
        (c) => c.NotFoundComponent,
      ),
    title: "Not Found",
  },
  {
    path: "**",
    redirectTo: "not-found",
  },
];
