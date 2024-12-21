import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { SupabaseService } from "../../../services/supabase/supabase.service";
import { map } from "rxjs";

export const AuthGuard: CanActivateFn = (route, state) => {
  const router: Router = inject(Router);
  const supabase: SupabaseService = inject(SupabaseService);

  return supabase.session$.pipe(
    map((session) => {
      if (session) {
        return true;
      } else {
        router.navigate(["/login"]);
        return false;
      }
    })
  );
};
