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
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import { RippleModule } from 'primeng/ripple';
import { TextareaModule } from 'primeng/textarea';
import { Subscription } from 'rxjs';
import { Publication, PublicationDetails } from '../../interfaces/publications';
import { ToastService } from '../../services/toast/toast.service';
import {
  paginationOptions,
  toastMessages,
  ToastSeverity,
} from '../../utils/constants';
import { formatDate } from '../../utils/helper';
import { PublicationService } from '../../services/publication/publication.service';

@Component({
  selector: 'app-vendor-details',
  standalone: true,
  imports: [
    ButtonModule,
    ConfirmDialog,
    RippleModule,
    Dialog,
    InputTextModule,
    RadioButton,
    TextareaModule,
    AgGridAngular,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './vendor-details.component.html',
  styleUrl: './vendor-details.component.css',
  providers: [ToastService, ConfirmationService],
})
export class VendorDetailsComponent implements OnInit, OnDestroy {
  public vendor: WritableSignal<Publication> = signal<Publication>({} as Publication);
  public vendorDetails: WritableSignal<PublicationDetails[]> = signal<
    PublicationDetails[]
  >([]);

  public isAddInvoiceDialogOpen: boolean = false;
  public newInvoiceFormGroup = new FormGroup({
    invoice_no: new FormControl(null, [Validators.required]),
    invoice_date: new FormControl(null, [Validators.required]),
    ro_no: new FormControl(null, [Validators.required]),
    ro_date: new FormControl(null, [Validators.required]),
    amount: new FormControl(null, [Validators.required]),
    gst_rate: new FormControl(null, [Validators.required]),
    description: new FormControl(null, [Validators.required]),
  });

  public gridOptions!: GridOptions;
  public deleteInvoiceIsDisabled: boolean = true;

  private vendorId: WritableSignal<number> = signal<number>(-1);
  private subscriptionManager: Subscription = new Subscription();
  private publicationSerivce: PublicationService = inject(PublicationService);
  private gridApi: GridApi = {} as GridApi;
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private toastService: ToastService = inject(ToastService);
  private confirmationService: ConfirmationService = inject(ConfirmationService);

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
        mode: 'multiRow',
      },
      columnDefs: [
        {
          field: 'invoice_no',
          headerName: 'Invoice No.',
        },
        {
          field: 'invoice_date',
          headerName: 'Invoice Date',
          valueFormatter: (params) => {
            return formatDate(params.value);
          },
        },
        {
          field: 'ro_no',
          headerName: 'RO Number',
        },
        {
          field: 'ro_date',
          headerName: 'RO Date',
          valueFormatter: (params) => {
            return formatDate(params.value);
          },
        },
        {
          field: 'amount',
          headerName: 'Amount',
          valueFormatter: (params) => {
            return formatCurrency(params.value, 'en-IN', 'Rs. ');
          },
        },
        {
          field: 'gst_rate',
          headerName: 'GST',
          valueFormatter: (params) => {
            return `${params.value}%`;
          },
        },
        {
          field: 'gross_amount',
          headerName: 'Gross Amount',
          valueFormatter: (params) => {
            return formatCurrency(params.value, 'en-IN', 'Rs. ');
          },
        },
        {
          field: 'description',
          headerName: 'Description',
          minWidth: 300,
        },
      ],
      onGridReady: (params: GridReadyEvent) => {
        this.gridApi = params.api;
      },
      onSelectionChanged: () => {
        this.deleteInvoiceIsDisabled =
          this.gridApi.getSelectedRows().length === 0;
      },
    };
  }

  private fetchVendorDetails(): void {
    this.subscriptionManager.add(
      this.publicationSerivce
        .getPublicationDetailsById(this.vendorId())
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
      this.publicationSerivce.getPublicationById(this.vendorId()).subscribe({
        next: (response: PostgrestSingleResponse<Publication>) => {
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

  /**
   * Deletes the selected invoices from the backend and updates the grid by
   * fetching the latest list of vendor details. If the response contains an
   * error, it is displayed as a toast notification.
   */
  private deleteInvoices(): void {
    const selectedIds = this.gridApi.getSelectedRows().map((row) => row.id);
    this.subscriptionManager.add(
      this.publicationSerivce
        .deletePublicationDetailsById(selectedIds)
        .subscribe({
          error: (error) => {
            this.toastService.addToast(
              ToastSeverity.ERROR,
              toastMessages.ERROR.TITLE.CONTACT_ADMIN,
              toastMessages.ERROR.MESSAGE.CONTACT_ADMIN
            );
          },
          complete: () => {
            this.fetchVendorDetails();
            this.toastService.addToast(
              ToastSeverity.SUCCESS,
              toastMessages.SUCCESS.TITLE.DELETE_INVOICE,
              toastMessages.SUCCESS.MESSAGE.DELETE_INVOICE
            );
          },
        })
    );
  }

  /**
   * Opens the add invoice dialog.
   *
   * This method is a no-op if the dialog is already open.
   */
  public showAddInvoiceDialog(): void {
    this.isAddInvoiceDialogOpen = true;
  }

  /**
   * Adds a new invoice to the vendor associated with the current route.
   *
   * The form values from `newInvoiceFormGroup` are used to construct a
   * `VendorDetails` object that is passed to the `addNewVendorDetailById`
   * method from the `vendorManagementService`. The response is handled to
   * display a toast notification for success or error.
   *
   * If the form is not valid, the form controls are marked as touched to
   * display validation errors.
   */
  public addNewInvoice(): void {
    if (this.newInvoiceFormGroup.valid) {
      const formValue = this.newInvoiceFormGroup.value;
      const requestPayload: PublicationDetails = {
        invoice_no: formValue.invoice_no ?? '',
        invoice_date: formValue.invoice_date ?? new Date(),
        ro_no: formValue.ro_no ?? '',
        ro_date: formValue.ro_date ?? new Date(),
        amount: formValue.amount ?? 0,
        gst_rate: formValue.gst_rate ?? 5,
        gross_amount: 0,
        description: formValue.description ?? '',
        publication_id: this.vendorId(),
      };
      requestPayload.gross_amount =
        requestPayload.amount +
        requestPayload.amount * (Number(requestPayload.gst_rate) / 100);
      this.subscriptionManager.add(
        this.publicationSerivce
          .addNewPublicationDetailById(requestPayload)
          .subscribe({
            next: (response: PostgrestSingleResponse<PublicationDetails[]>) => {
              const { error } = response;
              if (error) {
                this.toastService.addToast(
                  ToastSeverity.ERROR,
                  error.name,
                  error.message,
                  error.code
                );
              } else {
                this.toastService.addToast(
                  ToastSeverity.SUCCESS,
                  toastMessages.SUCCESS.TITLE.NEW_INVOICE,
                  toastMessages.SUCCESS.MESSAGE.NEW_INVOICE
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
              this.isAddInvoiceDialogOpen = false;
              this.newInvoiceFormGroup.reset();
              this.fetchVendorDetails();
            },
          })
      );
    } else {
      this.newInvoiceFormGroup.markAllAsTouched();
    }
  }

  /**
   * Exports the grid data as a CSV file.
   *
   * This method uses the `exportDataAsCsv` method from the `gridApi` to export
   * the current grid data as a CSV file. The file is saved to the user's
   * default download location.
   */
  public exportAsCSV(): void {
    this.gridApi.exportDataAsCsv();
  }

  /**
   * Confirms with the user whether or not they want to delete the selected
   * invoices. If the user confirms, the invoices are deleted by calling the
   * `deleteInvoices` method.
   *
   * The confirmation dialog is displayed with a message asking the user to
   * confirm the deletion, and buttons for 'Cancel' and 'Delete'. If the user
   * clicks 'Cancel', a toast notification is displayed with a message indicating
   * that the deletion was cancelled. If the user clicks 'Delete', the
   * `deleteInvoices` method is called to delete the selected invoices.
   */
  public confirmDeleteInvoices(): void {
    this.confirmationService.confirm({
      message: `Are you sure that you want to delete these invoices?`,
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
        this.deleteInvoices();
      },
    });
  }

  ngOnDestroy(): void {
    this.subscriptionManager.unsubscribe();
  }
}
