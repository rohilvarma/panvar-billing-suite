import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase/supabase.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const router: Router = inject(Router);
  const supabase: SupabaseService = inject(SupabaseService);

  if(!supabase.session) {
    router.navigate(['/login']);
  }

  return supabase.session !== null;
};
