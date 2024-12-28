import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const router: Router = inject(Router);
  const supabase: AuthService = inject(AuthService);

  return supabase.session$.pipe(
    map((session) => {
      if (session) {
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    })
  );
};
