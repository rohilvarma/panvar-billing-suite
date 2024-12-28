import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  AuthTokenResponsePassword,
  isAuthApiError,
} from '@supabase/supabase-js';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Toast } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { ToastService } from '../../services/toast/toast.service';
import { toastMessages, ToastSeverity } from '../../utils/constants';

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

  private router: Router = inject(Router);
  private toastService: ToastService = inject(ToastService);
  private subscriptionManager: Subscription = new Subscription();
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

  public login(): void {
    if (this.formGroup.valid) {
      const email = this.formGroup.get('email')?.value;
      const password = this.formGroup.get('password')?.value;
      this.subscriptionManager.add(
        this.auth
          .login(email, password)
          .subscribe((response: AuthTokenResponsePassword) => {
            const { data, error } = response;
            if (isAuthApiError(error)) {
              this.toastService.addToast(
                ToastSeverity.ERROR,
                error.name,
                error.message,
                error.status.toString()
              );
            }
            if (data !== null && data.user !== null) {
              this.formGroup.reset();
              this.router.navigate(['/']);
              this.toastService.addToast(
                ToastSeverity.SUCCESS,
                toastMessages.SUCCESS.TITLE.LOGIN,
                toastMessages.SUCCESS.MESSAGE.LOGIN
              );
            }
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
