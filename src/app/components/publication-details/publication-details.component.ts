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
import { PublicationService } from '../../services/publication/publication.service';
import { ToastService } from '../../services/toast/toast.service';
import {
  paginationOptions,
  toastMessages,
  ToastSeverity,
} from '../../utils/constants';
import { formatDate } from '../../utils/helper';

@Component({
  selector: 'app-publication-details',
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
  templateUrl: './publication-details.component.html',
  styleUrl: './publication-details.component.css',
  providers: [ToastService, ConfirmationService],
})
export class PublicationDetailsComponent implements OnInit, OnDestroy {
  public publication: WritableSignal<Publication> = signal<Publication>(
    {} as Publication
  );
  public publicationDetails: WritableSignal<PublicationDetails[]> = signal<
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

  private publicationId: WritableSignal<number> = signal<number>(-1);
  private subscriptionManager: Subscription = new Subscription();
  private publicationSerivce: PublicationService = inject(PublicationService);
  private gridApi: GridApi = {} as GridApi;
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private toastService: ToastService = inject(ToastService);
  private confirmationService: ConfirmationService =
    inject(ConfirmationService);

  ngOnInit(): void {
    this.publicationId.set(this.route.snapshot.params['id']);
    this.initialiseGridOptions();
    this.fetchPublication();
  }

  /**
   * Initialise the grid options. This function sets the grid options to display
   * the invoice details. It sets the column definitions, the pagination,
   * the row selection, and the value formatters for the columns.
   *
   * The row selection is set to allow multi-row selection, and the onSelectionChanged
   * event is used to update the delete button's state. The button is disabled if no
   * rows are selected.
   *
   * The column definitions are set to display the invoice details in the correct
   * format. The value formatters are used to format the dates and amounts.
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

  /**
   * Fetches the publication details and updates the publicationDetails signal
   * with the response.
   *
   * If the request is successful, the publicationDetails signal is set with
   * the fetched data. If the response contains an error, a toast is displayed
   * with the error message. In case of a request error, a toast is added with
   * a default error message. On completion, the grid data is updated with the
   * publication details.
   */
  private fetchPublicationDetails(): void {
    this.subscriptionManager.add(
      this.publicationSerivce
        .getPublicationDetailsById(this.publicationId())
        .subscribe({
          next: (response: any) => {
            const { data, error } = response;
            if (data) {
              this.publicationDetails.set(data);
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
            this.gridApi.setGridOption('rowData', this.publicationDetails());
          },
        })
    );
  }

  /**
   * Fetches the publication data and updates the publication signal with the response.
   * If the request fails, a toast is added with the error message.
   * If the request errors, a toast is added with the default error message.
   * If the request is successful and the publication is not found, the user is
   * redirected to the dashboard and a toast is added with the error message.
   * The publication details are then refetched.
   */
  private fetchPublication(): void {
    this.subscriptionManager.add(
      this.publicationSerivce
        .getPublicationById(this.publicationId())
        .subscribe({
          next: (response: PostgrestSingleResponse<Publication>) => {
            const { data, error } = response;
            if (data) {
              this.publication.set(data);
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
            this.fetchPublicationDetails();
          },
        })
    );
  }

  /**
   * Deletes the selected invoices from the database.
   *
   * This method is called when the user clicks the "Delete Invoice" button.
   * It retrieves the selected invoices from the grid and makes a request to
   * the PublicationService to delete them. If the request fails or errors,
   * a toast is added with the error message. If the request is successful,
   * a toast is added with a success message, and the publication details are
   * refetched.
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
            this.fetchPublicationDetails();
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
   * Submits the 'Add Invoice' form and attempts to add a new invoice
   * to the database.
   *
   * If the form is valid, the submission is sent to the PublicationService
   * to be added to the database. If the request is successful, a toast is
   * added with a success message, and the publication details are refetched.
   * If the request fails or errors, a toast is added with the error message.
   * If the form is invalid, all form controls are marked as touched to show
   * the validation errors.
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
        publication_id: this.publicationId(),
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
              this.fetchPublicationDetails();
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
   * Opens a confirmation dialog for deleting invoices.
   *
   * This method uses the confirmation service to display a dialog
   * asking the user to confirm the deletion of selected invoices.
   * If the user confirms, the selected invoices are deleted.
   * If the user cancels, a toast message indicating the cancellation
   * is displayed.
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
