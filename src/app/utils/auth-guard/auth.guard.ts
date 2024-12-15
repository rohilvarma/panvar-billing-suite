import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { AuthSessionMissingError, UserResponse } from '@supabase/supabase-js';

export const authGuard: CanActivateFn = (route, state) => {
  const _router = inject(Router);
  const supabase: SupabaseService = inject(SupabaseService);

  supabase.isAuthenticated().subscribe((response: UserResponse) => {
    if(response.data.user === null || response.error instanceof AuthSessionMissingError) {
      _router.navigate(['login']);
    }
    console.log(response.data.user);
    
    
  });


  return false
  // return response !== null;
  
};
