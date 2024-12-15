import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthSession } from '@supabase/supabase-js';
import { ButtonModule } from 'primeng/button';
import { SupabaseService } from '../../services/supabase/supabase.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [ButtonModule, RouterLink],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent implements OnInit {
  public session: AuthSession | null = null;
  private _supabase: SupabaseService = inject(SupabaseService);

  ngOnInit(): void {
    this._supabase.onAuthChange((_, session)=>(this.session = session))
  }

  public logout(): void {
    this._supabase.logout();
  }
}
