import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Skeleton } from 'primeng/skeleton';
import { Subscription } from 'rxjs';
import { Vendor } from '../../interfaces/vendors';
import { ToastService } from '../../services/toast/toast.service';
import { VendorManagementService } from '../../services/vendor-management/vendor-management.service';
import { toastMessages, ToastSeverity } from '../../utils/constants';
import { counterArray } from '../../utils/helper';

type NewVendor = {
  name: string;
  publication_name: string;
  email: string;
  user_id?: string;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    Skeleton,
    ButtonModule,
    ConfirmDialog,
    Dialog,
    ReactiveFormsModule,
    InputTextModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  providers: [ToastService, ConfirmationService],
})
export class DashboardComponent implements OnInit, OnDestroy {
  public vendorDetails: WritableSignal<Vendor[]> = signal<Vendor[]>([]);
  public counterArray = counterArray;
  public isLoadingVendors: boolean = false;

  private vendorManagementService: VendorManagementService = inject(
    VendorManagementService
  );

  public isAddVendorDialogVisible: boolean = false;
  public newVendorForm: FormGroup = new FormGroup({
    name: new FormControl(null, [Validators.required]),
    email: new FormControl(null, [Validators.required, Validators.email]),
    publication_name: new FormControl(null, [Validators.required]),
  });

  private subscriptionManager: Subscription = new Subscription();
  private toastService: ToastService = inject(ToastService);
  private confirmationService: ConfirmationService =
    inject(ConfirmationService);

  ngOnInit(): void {
    this.fetchAllVendors();
  }

  /**
   * Fetches the list of vendors from the backend and updates the
   * `vendorDetails` signal with the response. If the response contains an
   * error, it is displayed as a toast notification.
   */
  private fetchAllVendors(): void {
    this.toggleIsLoadingVendors();
    this.subscriptionManager.add(
      this.vendorManagementService.getAllVendors().subscribe({
        next: (response: PostgrestSingleResponse<Vendor[]>) => {
          const { data, error } = response;
          if (data) {
            this.vendorDetails.set(data);
          } else {
            this.toastService.addToast(
              ToastSeverity.ERROR,
              error.name,
              error.message,
              error.code
            );
          }
        },
        error: (error) => {
          this.toastService.addToast(
            ToastSeverity.ERROR,
            toastMessages.ERROR.TITLE.CONTACT_ADMIN,
            toastMessages.ERROR.MESSAGE.CONTACT_ADMIN
          );
          this.vendorDetails.set([]);
        },
        complete: () => {
          this.toggleIsLoadingVendors();
        },
      })
    );
  }

  /**
   * Toggles the `isLoadingVendors` flag. This flag is used to conditionally
   * render the vendor list or a loading indicator.
   */
  private toggleIsLoadingVendors(): void {
    this.isLoadingVendors = !this.isLoadingVendors;
  }

  /**
   * Opens the add vendor dialog.
   *
   * This method is a no-op if the dialog is already open.
   */
  public showAddVendorDialog(): void {
    this.isAddVendorDialogVisible = true;
  }

  /**
   * Adds a new vendor using the form data from `newVendorForm`.
   *
   * If the form is valid, it constructs a `NewVendor` object and calls the
   * `addVendor` method from the `vendorManagementService` to insert the vendor
   * into the backend. The response is handled to display appropriate toast
   * messages for success or error.
   *
   * If the form is not valid, all form controls are marked as touched to
   * display validation errors.
   */
  public addNewVendor(): void {
    if (this.newVendorForm.valid) {
      const newVendor: NewVendor = {
        name: this.newVendorForm.get('name')?.value!,
        publication_name: this.newVendorForm.get('publication_name')?.value!,
        email: this.newVendorForm.get('email')?.value!,
      };
      this.subscriptionManager.add(
        this.vendorManagementService.addVendor(newVendor).subscribe({
          next: (response: PostgrestSingleResponse<Vendor[]>) => {
            const { error } = response;
            if (error) {
              this.toastService.addToast(
                ToastSeverity.ERROR,
                error.name,
                error.message,
                error.code
              );
            }
          },
          error: (error) => {
            this.toastService.addToast(
              ToastSeverity.ERROR,
              toastMessages.ERROR.TITLE.CONTACT_ADMIN,
              toastMessages.ERROR.MESSAGE.CONTACT_ADMIN
            );
          },
          complete: () => {
            this.isAddVendorDialogVisible = false;
            this.fetchAllVendors();
            this.toastService.addToast(
              ToastSeverity.SUCCESS,
              toastMessages.SUCCESS.TITLE.NEW_VENDOR,
              toastMessages.SUCCESS.MESSAGE.NEW_VENDOR
            );
          },
        })
      );
    } else {
      this.newVendorForm.markAllAsTouched();
    }
  }

  /**
   * Deletes a vendor from the backend, and updates the vendor list by
   * fetching the latest list of vendors. If the response contains an error,
   * it is displayed as a toast notification.
   *
   * @param vendor The vendor to delete.
   */
  private deleteVendor(vendor: Vendor): void {
    this.subscriptionManager.add(
      this.vendorManagementService.deleteVendorById(vendor.id).subscribe({
        error: (error) => {
          this.toastService.addToast(
            ToastSeverity.ERROR,
            toastMessages.ERROR.TITLE.CONTACT_ADMIN,
            toastMessages.ERROR.MESSAGE.CONTACT_ADMIN
          );
        },
        complete: () => {
          this.fetchAllVendors();
          this.toastService.addToast(
            ToastSeverity.SUCCESS,
            toastMessages.SUCCESS.TITLE.DELETE_VENDOR,
            toastMessages.SUCCESS.MESSAGE.DELETE_VENDOR
          );
        },
      })
    );
  }

  /**
   * Confirms with the user whether or not they want to delete the given
   * vendor, and all of its invoices. If the user confirms, the vendor is
   * deleted by calling the `deleteVendor` method.
   *
   * @param vendor The vendor to delete.
   */
  public confirmDeleteVendor(vendor: Vendor): void {
    this.confirmationService.confirm({
      message: `Are you sure that you want to delete vendor, <b>${vendor.publication_name}</b>, and all of its invoices?`,
      header: 'Confirm Deletion',
      closable: true,
      closeOnEscape: true,
      defaultFocus: 'close',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      reject: () => {
        this.toastService.addToast(
          ToastSeverity.INFO,
          toastMessages.INFO.TITLE.CANCELLED,
          toastMessages.INFO.MESSAGE.CANCELLED
        );
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
      },
      accept: () => {
        this.deleteVendor(vendor);
      },
    });
  }

  ngOnDestroy(): void {
    this.subscriptionManager.unsubscribe();
  }
}
