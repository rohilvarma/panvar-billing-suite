import { formatCurrency } from '@angular/common';
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
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { TextareaModule } from 'primeng/textarea';
import { Subscription } from 'rxjs';
import { Vendor, VendorDetails } from '../../interfaces/vendors';
import { ToastService } from '../../services/toast/toast.service';
import { VendorManagementService } from '../../services/vendor-management/vendor-management.service';
import {
  paginationOptions,
  toastMessages,
  ToastSeverity,
} from '../../utils/constants';
import { formatDate } from '../../utils/helper';

@Component({
  selector: 'app-vendor-details',
  standalone: true,
  imports: [
    ButtonModule,
    RippleModule,
    Dialog,
    InputTextModule,
    TextareaModule,
    AgGridAngular,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './vendor-details.component.html',
  styleUrl: './vendor-details.component.css',
  providers: [ToastService],
})
export class VendorDetailsComponent implements OnInit, OnDestroy {
  public vendor: WritableSignal<Vendor> = signal<Vendor>({} as Vendor);
  public vendorDetails: WritableSignal<VendorDetails[]> = signal<
    VendorDetails[]
  >([]);

  public isAddInvoiceDialogOpen: boolean = false;
  public newInvoiceFormGroup = new FormGroup({
    invoice_no: new FormControl(null, [Validators.required]),
    created_at: new FormControl(null, [Validators.required]),
    ro_no: new FormControl(null, [Validators.required]),
    ro_date: new FormControl(null, [Validators.required]),
    amount: new FormControl(null, [Validators.required]),
    description: new FormControl(null, [Validators.required]),
  });

  public gridOptions!: GridOptions;

  private vendorId: WritableSignal<number> = signal<number>(-1);
  private subscriptionManager: Subscription = new Subscription();
  private vendorManagementService: VendorManagementService = inject(
    VendorManagementService
  );
  private gridApi: GridApi = {} as GridApi;
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private toastService: ToastService = inject(ToastService);

  ngOnInit(): void {
    this.vendorId.set(this.route.snapshot.params['id']);
    this.initialiseGridOptions();
    this.fetchVendor();
  }

  /**
   * Initializes the grid options with default column definitions and other options.
   * The columns are:
   * - Invoice No.
   * - Date
   * - RO Number
   * - RO Date
   * - Amount
   * - Description
   *
   * The grid is also configured to use pagination with a page size of 10, and
   * the page size can be changed by the user.
   *
   * The `onGridReady` callback is used to save the grid API to an instance
   * variable so that it can be used later to manipulate the grid.
   */
  private initialiseGridOptions(): void {
    this.gridOptions = {
      defaultColDef: {
        sortable: true,
        filter: true,
        flex: 1,
      },
      pagination: true,
      paginationPageSize: paginationOptions.rows,
      paginationPageSizeSelector: paginationOptions.rowsPerPageOptions,
      rowSelection: {
        mode: 'multiRow'
      },
      columnDefs: [
        {
          field: 'invoice_no',
          headerName: 'Invoice No.',
          maxWidth: 150,
        },
        {
          field: 'created_at',
          headerName: 'Date',
          valueFormatter: (params) => {
            return formatDate(params.value);
          },
          maxWidth: 150,
        },
        {
          field: 'ro_no',
          headerName: 'RO Number',
          maxWidth: 150,
        },
        {
          field: 'ro_date',
          headerName: 'RO Date',
          valueFormatter: (params) => {
            return formatDate(params.value);
          },
          maxWidth: 150,
        },
        {
          field: 'amount',
          headerName: 'Amount',
          valueFormatter: (params) => {
            return formatCurrency(params.value, 'en-IN', 'Rs. ');
          },
          maxWidth: 150,
        },
        {
          field: 'description',
          headerName: 'Description',
        },
      ],
      onGridReady: (params: GridReadyEvent) => {
        this.gridApi = params.api;
      },
    };
  }

  private fetchVendorDetails(): void {
    this.subscriptionManager.add(
      this.vendorManagementService
        .getVendorDetailsById(this.vendorId())
        .subscribe({
          next: (response: any) => {
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
          },
          complete: () => {
            this.gridApi.setGridOption('rowData', this.vendorDetails());
          },
        })
    );
  }

  /**
   * Fetches the vendor details from the backend and updates the
   * `vendor` signal with the response. If the response contains an
   * error, it is displayed as a toast notification and the user is
   * redirected to the home page.
   */
  private fetchVendor(): void {
    this.subscriptionManager.add(
      this.vendorManagementService.getVendorById(this.vendorId()).subscribe({
        next: (response: PostgrestSingleResponse<Vendor>) => {
          const { data, error } = response;
          if (data) {
            this.vendor.set(data);
          } else {
            this.router.navigate(['/']);
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
          this.fetchVendorDetails();
        },
      })
    );
  }

  public showAddInvoiceDialog(): void {
    this.isAddInvoiceDialogOpen = true;
  }

  public addNewInvoice(): void {
    const formValue = this.newInvoiceFormGroup.value;
    const requestPayload: VendorDetails = {
      invoice_no: formValue.invoice_no ?? '',
      created_at: formValue.created_at ?? new Date(),
      ro_no: formValue.ro_no ?? '',
      ro_date: formValue.ro_date ?? new Date(),
      amount: formValue.amount ?? 0,
      description: formValue.description ?? '',
      vendor_id: this.vendorId(),
    };
    this.subscriptionManager.add(
      this.vendorManagementService.addNewVendorDetailById(requestPayload).subscribe({
        next: (response: PostgrestSingleResponse<VendorDetails[]>) => {
          const {error} = response
          if(error) {
            this.toastService.addToast(
              ToastSeverity.ERROR,
              error.name,
              error.message,
              error.code
            );
          }
          else {
            this.toastService.addToast(
              ToastSeverity.SUCCESS,
              toastMessages.SUCCESS.TITLE.NEW_INVOICE,
              toastMessages.SUCCESS.MESSAGE.NEW_INVOICE
            )
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
          this.isAddInvoiceDialogOpen = false;
          this.newInvoiceFormGroup.reset();
          this.fetchVendorDetails();
        }
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptionManager.unsubscribe();
  }
}
