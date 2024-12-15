import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthTokenResponsePassword, isAuthApiError } from '@supabase/supabase-js';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Toast } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { ToastService } from '../../services/toast/toast.service';
import { ToastSeverity } from '../../utils/constants';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    Toast,
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
  providers: [ToastService, MessageService],
})
export class LoginComponent implements OnInit, OnDestroy {
  public formGroup: FormGroup = new FormGroup({});

  private _router: Router = inject(Router);
  private _toastService: ToastService = inject(ToastService);
  private _subscriptionManager: Subscription = new Subscription();
  private _supabase: SupabaseService = inject(SupabaseService);
  ngOnInit(): void {
    if(this._supabase.session) {
      this._router.navigate(['/']);
    }
    else {
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
  }

  public login() {
    if (this.formGroup.valid) {
      const email = this.formGroup.get('email')?.value;
      const password = this.formGroup.get('password')?.value;
      this._subscriptionManager.add(
        this._supabase.login(email, password).subscribe((response: AuthTokenResponsePassword) => {
          const { data, error } = response;
          if (isAuthApiError(error)) {
            this._toastService.addToast(
              ToastSeverity.ERROR,
              error.name,
              error.message,
              error.status
            );
          }
          if (data !== null && data.user !== null) {
            this._toastService.addToast(
              ToastSeverity.SUCCESS,
              'Success',
              'User logged in successfully'
            );
            this.formGroup.reset();
            this._router.navigate(['/']);
          }
        })
      )
    } else {
      this.formGroup.markAllAsTouched();
    }
  }

  ngOnDestroy(): void {
    this._subscriptionManager.unsubscribe();
  }
}
