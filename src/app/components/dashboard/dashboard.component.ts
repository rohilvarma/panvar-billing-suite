import {
  Component,
  signal,
  OnInit,
  inject,
  OnDestroy,
  WritableSignal,
} from '@angular/core';
import {RouterLink} from '@angular/router';
import {VendorManagementService} from '../../services/vendor-management/vendor-management.service';
import {Subscription} from 'rxjs';
import {
  IVendor,
  IVendorResponse, NewVendor,
} from '../../interfaces/vendor-detail.interface';
import {ToastService} from '../../services/toast/toast.service';
import {Skeleton} from 'primeng/skeleton';
import {counterArray} from '../../utils/helper';
import {ButtonModule} from 'primeng/button';
import {ToastSeverity} from '../../utils/constants';
import {Dialog} from 'primeng/dialog';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, Skeleton, ButtonModule, Dialog, ReactiveFormsModule, InputTextModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  public vendorDetails: WritableSignal<IVendor[]> = signal<IVendor[]>([]);
  public counterArray = counterArray;
  private vendorManagementService: VendorManagementService = inject(
    VendorManagementService
  );

  public isAddVendorDialogVisible: boolean = false;
  public newVendorForm: FormGroup = new FormGroup({
    name: new FormControl(null, [Validators.required]),
    email: new FormControl(null, [Validators.required]),
    publication_name: new FormControl(null, [Validators.required]),
  });

  private subscriptionManager = new Subscription();
  private toastService: ToastService = inject(ToastService);

  ngOnInit(): void {
    this.fetchVendors();
  }

  /**
   * Fetches the list of vendors from the backend and updates the
   * `vendorDetails` signal with the response. If the response contains an
   * error, it is displayed as a toast notification.
   */
  private fetchVendors(): void {
    this.subscriptionManager.add(
      this.vendorManagementService
        .getAllVendors()
        .subscribe((response: IVendorResponse) => {
          if (response.error) {
            this.toastService.addToast(
              ToastSeverity.ERROR,
              response.error.code,
              response.error.message
            );
          } else {
            this.vendorDetails.set(response.data);
          }
        })
    );
  }

  /**
   * Opens the add vendor dialog.
   *
   * This method is a no-op if the dialog is already open.
   */
  public showAddVendorDialog(): void {
    this.isAddVendorDialogVisible = true;
  }

  public addNewVendor(): void {
    if (this.newVendorForm.valid) {
      const newVendor: NewVendor = {
        name: this.newVendorForm.get('name')?.value!,
        publication_name: this.newVendorForm.get('publication_name')?.value!,
        email: this.newVendorForm.get('email')?.value!
      }
      this.subscriptionManager.add(
        this.vendorManagementService.addVendor(newVendor).subscribe((response: IVendorResponse) => {
          if (response.error) {
            this.toastService.addToast(
              ToastSeverity.ERROR,
              response.error.code,
              response.error.message
            )
          }
          else {
            this.toastService.addToast(
              ToastSeverity.SUCCESS,
              'Success',
              'Vendor added successfully'
            )
            this.isAddVendorDialogVisible = false;
          }
        })
      )
    } else {
      this.newVendorForm.markAllAsTouched();
    }
  }

  ngOnDestroy(): void {
    this.subscriptionManager.unsubscribe();
  }
}
