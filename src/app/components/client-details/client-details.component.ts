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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import { RippleModule } from 'primeng/ripple';
import { Subscription } from 'rxjs';
import { Client, ClientDetails } from '../../interfaces/clients';
import { ClientService } from '../../services/client/client.service';
import { ToastService } from '../../services/toast/toast.service';
import {
  paginationOptions,
  toastMessages,
  ToastSeverity,
} from '../../utils/constants';
import { formatAmount, formatDate } from '../../utils/helper';

@Component({
  selector: 'app-client-details',
  standalone: true,
  imports: [
    AgGridAngular,
    ButtonModule,
    RippleModule,
    InputTextModule,
    RadioButton,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
    Dialog,
  ],
  templateUrl: './client-details.component.html',
  styleUrl: './client-details.component.css',
  providers: [ToastService, ConfirmationService],
})
export class ClientDetailsComponent implements OnInit, OnDestroy {
  public totalBusiness: string = "";
  public client: WritableSignal<Client> = signal<Client>({} as Client);
  public clientDetails: WritableSignal<ClientDetails[]> = signal<
    ClientDetails[]
  >([]);
  public gridOptions!: GridOptions;
  public deleteInvoiceIsDisabled: boolean = true;
  public isAddInvoiceDialogOpen: boolean = false;
  public newInvoiceFormGroup = new FormGroup({
    invoice_no: new FormControl(null, [Validators.required]),
    invoice_date: new FormControl(null, [Validators.required]),
    amount: new FormControl(null, [Validators.required]),
    gst_rate: new FormControl(null, [Validators.required]),
  });

  private clientId: WritableSignal<number> = signal<number>(-1);
  private clientService: ClientService = inject(ClientService);
  private gridApi: GridApi = {} as GridApi;
  private subscriptionManager: Subscription = new Subscription();
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private toastService: ToastService = inject(ToastService);
  private confirmationService: ConfirmationService =
    inject(ConfirmationService);

  ngOnInit(): void {
    this.clientId.set(this.route.snapshot.params['id']);
    this.initialiseGridOptions();
    this.fetchClient();
  }

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
          field: 'amount',
          headerName: 'Amount',
          valueFormatter: (params) => {
            return formatAmount(params.value);
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
            return formatAmount(params.value);
          },
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

  private fetchClient(): void {
    this.subscriptionManager.add(
      this.clientService.getClientById(this.clientId()).subscribe({
        next: (response: PostgrestSingleResponse<Client>) => {
          const { data, error } = response;
          if (data) {
            this.client.set(data);
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
        error: (err) => [
          this.toastService.addToast(
            ToastSeverity.ERROR,
            toastMessages.ERROR.TITLE.CONTACT_ADMIN,
            toastMessages.ERROR.MESSAGE.CONTACT_ADMIN
          ),
        ],
        complete: () => {
          this.fetchClientDetails();
        },
      })
    );
  }

  private fetchClientDetails(): void {
    this.subscriptionManager.add(
      this.clientService.getClientDetailsById(this.clientId()).subscribe({
        next: (response: PostgrestSingleResponse<ClientDetails[]>) => {
          const { data, error } = response;
          if (data) {
            this.clientDetails.set(data);
          } else {
            this.toastService.addToast(
              ToastSeverity.ERROR,
              error.name,
              error.message,
              error.code
            );
          }
        },
        error: (err) => [
          this.toastService.addToast(
            ToastSeverity.ERROR,
            toastMessages.ERROR.TITLE.CONTACT_ADMIN,
            toastMessages.ERROR.MESSAGE.CONTACT_ADMIN
          ),
        ],
        complete: () => {
          this.gridApi.setGridOption('rowData', this.clientDetails());
          this.calculateTotalBusiness();
        },
      })
    );
  }

  /**
   * Calculates the total business of all the invoices associated with the
   * current client.
   *
   * This method is called when the component is initialized and whenever the
   * client details are updated. It iterates through the client details and
   * sums up the gross_amount of each invoice. The total business is stored in
   * the totalBusiness property.
   */
  private calculateTotalBusiness(): void {
    let total = 0;
    this.clientDetails().forEach((detail) => {
      total += detail.gross_amount;
    });
    this.totalBusiness = formatAmount(total);
  }

  /**
   * Deletes the selected invoices from the database.
   *
   * This method is called when the user clicks the "Delete Invoice" button.
   * It retrieves the selected invoices from the grid and makes a request to
   * the ClientService to delete them. If the request fails or errors,
   * a toast is added with the error message. If the request is successful,
   * a toast is added with a success message, and the client details are
   * refetched.
   */
  private deleteInvoices(): void {
    const selectedIds = this.gridApi.getSelectedRows().map((row) => row.id);
    this.subscriptionManager.add(
      this.clientService.deleteClientDetailsById(selectedIds).subscribe({
        error: (error) => {
          this.toastService.addToast(
            ToastSeverity.ERROR,
            toastMessages.ERROR.TITLE.CONTACT_ADMIN,
            toastMessages.ERROR.MESSAGE.CONTACT_ADMIN
          );
        },
        complete: () => {
          this.fetchClientDetails();
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
   * Opens the add invoice dialog.
   *
   * This method is a no-op if the dialog is already open.
   */
  public showAddInvoiceDialog(): void {
    this.isAddInvoiceDialogOpen = true;
  }

  /**
   * Opens a confirmation dialog to delete invoices.
   *
   * This method triggers a dialog asking the user to confirm the deletion
   * of selected invoices. If the user accepts, the selected invoices are
   * deleted. If the user rejects, a cancellation toast message is displayed.
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

  public addNewInvoice(): void {
    if (this.newInvoiceFormGroup.valid) {
      const formValue = this.newInvoiceFormGroup.value;
      const requestPayload: ClientDetails = {
        invoice_no: formValue.invoice_no ?? '',
        invoice_date: formValue.invoice_date ?? new Date(),
        amount: formValue.amount ?? 0,
        gst_rate: formValue.gst_rate ?? 5,
        gross_amount: 0,
        client_id: this.clientId(),
      };
      requestPayload.gross_amount =
        requestPayload.amount +
        requestPayload.amount * (Number(requestPayload.gst_rate) / 100);
      this.subscriptionManager.add(
        this.clientService.addClientInvoiceById(requestPayload).subscribe({
          next: (response: PostgrestSingleResponse<ClientDetails[]>) => {
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
            this.fetchClientDetails();
          },
        })
      );
    } else {
      this.newInvoiceFormGroup.markAllAsTouched();
    }
  }

  ngOnDestroy(): void {
    this.subscriptionManager.unsubscribe();
  }
}
