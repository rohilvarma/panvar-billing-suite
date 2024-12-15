import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SupabaseService } from '../../services/supabase/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ButtonModule,
    InputTextModule,
    FormsModule,
    FloatLabel,
    ReactiveFormsModule,
    PasswordModule,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  public formGroup: FormGroup = new FormGroup({});

  private supabase: SupabaseService = inject(SupabaseService);
  ngOnInit(): void {
    this.formGroup = new FormGroup({
      email: new FormControl<string | null>(null, [
        Validators.required,
        Validators.email,
      ]),
      password: new FormControl<string | null>(null, [
        Validators.required,
        Validators.minLength(8),
      ]),
    });
  }

  public login() {
    if (this.formGroup.valid) {
      const email = this.formGroup.get('email')?.value;
      const password = this.formGroup.get('password')?.value;
    } else {
      this.formGroup.markAllAsTouched();
    }
  }
}
