import { formatCurrency } from '@angular/common';
import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
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
  imports: [ButtonModule, RippleModule, AgGridAngular],
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

  ngOnDestroy(): void {
    this.subscriptionManager.unsubscribe();
  }
}
