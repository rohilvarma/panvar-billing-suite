import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthResponse, isAuthApiError } from '@supabase/supabase-js';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Toast } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { ToastService } from '../../services/toast/toast.service';
import { ToastSeverity } from '../../utils/constants';
import {AuthService} from '../../services/auth/auth.service';
import { toastMessages } from '../../utils/constants';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    ButtonModule,
    InputTextModule,
    FormsModule,
    FloatLabel,
    ReactiveFormsModule,
    PasswordModule,
    Toast,
    RouterLink,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
  providers: [ToastService, MessageService],
})
export class SignUpComponent implements OnInit, OnDestroy {
  public formGroup: FormGroup = new FormGroup({});

  private router: Router = inject(Router);
  private subscriptionManager: Subscription = new Subscription();
  private toastService = inject(ToastService);
  private auth: AuthService = inject(AuthService);

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
  public signup(): void {
    if (this.formGroup.valid) {
      const email = this.formGroup.get('email')?.value;
      const password = this.formGroup.get('password')?.value;

      this.subscriptionManager.add(
        this.auth.signup(email, password).subscribe({
          next: (response: AuthResponse) => {
            const { data, error } = response;
            if (isAuthApiError(error)) {
              this.toastService.addToast(
                ToastSeverity.ERROR,
                error.name,
                error.message,
                error.status.toString(),
              );
            }

            if (data !== null && data.user !== null) {
              this.toastService.addToast(
                ToastSeverity.SUCCESS,
                toastMessages.SUCCESS.TITLE.SIGN_UP,
                toastMessages.SUCCESS.MESSAGE.VERIFY_EMAIL
              );
              this.formGroup.reset();
              this.router.navigate(['/']);
            }
          },
          error: (err: any) => {
            this.toastService.addToast(
              ToastSeverity.ERROR,
              err.status,
              err.code,
              err.name,
              err.message
            );
          },
        })
      );
    } else {
      this.formGroup.markAllAsTouched();
    }
  }

  ngOnDestroy(): void {
    this.subscriptionManager.unsubscribe();
  }
}
