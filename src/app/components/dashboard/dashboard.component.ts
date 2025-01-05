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
import { SelectButton } from 'primeng/selectbutton';
import { RouterLink } from '@angular/router';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Skeleton } from 'primeng/skeleton';
import { Subscription } from 'rxjs';
import { NewPublication, Publication } from '../../interfaces/publications';
import { ToastService } from '../../services/toast/toast.service';

import { toastMessages, ToastSeverity } from '../../utils/constants';
import { counterArray } from '../../utils/helper';
import { PublicationService } from '../../services/publication/publication.service';
import { ClientService } from '../../services/client/client.service';
import { Client, NewClient } from '../../interfaces/clients';

type StateType = {
  label: string;
  value: boolean;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    Skeleton,
    ButtonModule,
    ConfirmDialog,
    FormsModule,
    SelectButton,
    Dialog,
    ReactiveFormsModule,
    InputTextModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  providers: [ToastService, ConfirmationService],
})
export class DashboardComponent implements OnInit, OnDestroy {
  // helper function
  public counterArray = counterArray;

  // Data signals
  public publicationDetails: WritableSignal<Publication[]> = signal<
    Publication[]
  >([]);
  public clientDetails: WritableSignal<any> = signal<any>([]);

  // Dashboard state management
  public isDashboardLoading: boolean = false;
  public isPublicationState: boolean = true;
  public stateOptions: any[] = [
    { label: 'Publications', value: true },
    { label: 'Clients', value: false },
  ];

  // Add new publication form
  public isAddPublicationDialogVisible: boolean = false;
  public newPublicationForm: FormGroup = new FormGroup({
    publication_name: new FormControl(null, [Validators.required]),
  });

  // Add new client form
  public isAddClientDialogVisible: boolean = false;
  public newClientForm: FormGroup = new FormGroup({
    client_name: new FormControl(null, [Validators.required]),
  });

  private subscriptionManager: Subscription = new Subscription();
  private toastService: ToastService = inject(ToastService);
  private confirmationService: ConfirmationService =
    inject(ConfirmationService);
  private publicationService: PublicationService = inject(PublicationService);
  private clientService: ClientService = inject(ClientService);

  ngOnInit(): void {
    this.fetchAllPublications();
    this.fetchAllClients();
  }

  /**
   * Fetches all clients from the database and updates the `clientDetails` signal with the results.
   * If the request is successful, the `clientDetails` signal is updated with the array of clients.
   * If the request fails, the `clientDetails` signal is updated with an empty array, and an error toast is displayed.
   */
  private fetchAllClients(): void {
    this.toggleIsDashboardLoading();
    this.subscriptionManager.add(
      this.clientService.getAllClients().subscribe({
        next: (response: PostgrestSingleResponse<Client[]>) => {
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
        error: (error) => {
          this.toastService.addToast(
            ToastSeverity.ERROR,
            toastMessages.ERROR.TITLE.CONTACT_ADMIN,
            toastMessages.ERROR.MESSAGE.CONTACT_ADMIN
          );
          this.clientDetails.set([]);
        },
        complete: () => {
          this.toggleIsDashboardLoading();
        },
      })
    )
  }

  /**
   * Fetches all publications and updates the publicationDetails signal with the response.
   * If the request fails, a toast is added with the error message.
   * If the request errors, a toast is added with the default error message.
   * The isLoadingPublications signal is toggled at the start and end of the function.
   */
  private fetchAllPublications(): void {
    this.toggleIsDashboardLoading();
    this.subscriptionManager.add(
      this.publicationService.getAllPublications().subscribe({
        next: (response: PostgrestSingleResponse<Publication[]>) => {
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
          this.publicationDetails.set([]);
        },
        complete: () => {
          this.toggleIsDashboardLoading();
        },
      })
    );
  }

  /**
   * Deletes a publication from the database.
   *
   * Calls the PublicationService to delete a publication by its ID.
   * If the request fails or errors, a toast is added with the error message.
   * If the request is successful, a toast is added with a success message,
   * and the publication list is refetched.
   *
   * @param publication The publication to be deleted.
   */
  private deletePublication(publication: Publication): void {
    this.subscriptionManager.add(
      this.publicationService.deletePublicationById(publication.id).subscribe({
        error: (error) => {
          this.toastService.addToast(
            ToastSeverity.ERROR,
            toastMessages.ERROR.TITLE.CONTACT_ADMIN,
            toastMessages.ERROR.MESSAGE.CONTACT_ADMIN
          );
        },
        complete: () => {
          this.fetchAllPublications();
          this.toastService.addToast(
            ToastSeverity.SUCCESS,
            toastMessages.SUCCESS.TITLE.DELETE_PUBLICATION,
            toastMessages.SUCCESS.MESSAGE.DELETE_PUBLICATION
          );
        },
      })
    );
  }

  /**
   * Deletes a client from the database.
   *
   * Calls the ClientService to delete a client by its ID.
   * If the request fails or errors, a toast is added with the error message.
   * If the request is successful, a toast is added with a success message,
   * and the client list is refetched.
   *
   * @param client The client to be deleted.
   */
  private deleteClient(client: Client): void {
    this.subscriptionManager.add(
      this.clientService.deleteClientById(client.id).subscribe({
        error: (error) => {
          this.toastService.addToast(
            ToastSeverity.ERROR,
            toastMessages.ERROR.TITLE.CONTACT_ADMIN,
            toastMessages.ERROR.MESSAGE.CONTACT_ADMIN
          );
        },
        complete: () => {
          this.fetchAllClients();
          this.toastService.addToast(
            ToastSeverity.SUCCESS,
            toastMessages.SUCCESS.TITLE.DELETE_CLIENT,
            toastMessages.SUCCESS.MESSAGE.DELETE_CLIENT
          );
        },
      })
    )
  }

  /**
   * Toggles the isDashboardLoading signal, which is used to show the loading animation
   * while the publications and clients are being fetched.
   */
  private toggleIsDashboardLoading(): void {
    this.isDashboardLoading = !this.isDashboardLoading;
  }

  /**
   * Opens the dialog for adding a new publication.
   *
   * Sets the 'isAddPublicationDialogVisible' flag to true, which triggers the display
   * of the 'Add Publication' dialog modal in the UI.
   */
  public showAddPublicationDialog(): void {
    this.isAddPublicationDialogVisible = true;
  }

  public showAddClientDialog(): void {
    this.isAddClientDialogVisible = true;
  }

  /**
   * Submits the 'Add Publication' form and attempts to add a new publication
   * to the database.
   *
   * If the form is valid, the submission is sent to the PublicationService
   * to be added to the database. If the request is successful, a toast is
   * added with a success message, and the publication list is refetched.
   * If the request fails or errors, a toast is added with the error message.
   * If the form is invalid, all form controls are marked as touched to show
   * the validation errors.
   */
  public addNewPublication(): void {
    if (this.newPublicationForm.valid) {
      const newPublication: NewPublication = {
        publication_name:
          this.newPublicationForm.get('publication_name')?.value!,
      };
      this.subscriptionManager.add(
        this.publicationService.addPublication(newPublication).subscribe({
          next: (response: PostgrestSingleResponse<Publication[]>) => {
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
            this.isAddPublicationDialogVisible = false;
            this.fetchAllPublications();
            this.toastService.addToast(
              ToastSeverity.SUCCESS,
              toastMessages.SUCCESS.TITLE.NEW_PUBLICATION,
              toastMessages.SUCCESS.MESSAGE.NEW_PUBLICATION
            );
          },
        })
      );
    } else {
      this.newPublicationForm.markAllAsTouched();
    }
  }

  /**
   * Submits the 'Add Client' form and attempts to add a new client
   * to the database.
   *
   * If the form is valid, the submission is sent to the ClientService
   * to be added to the database. If the request is successful, a toast is
   * added with a success message, and the client list is refetched.
   * If the request fails or errors, a toast is added with the error message.
   * If the form is invalid, all form controls are marked as touched to show
   * the validation errors.
   */
  public addNewClient(): void {
    if (this.newClientForm.valid) {
      const newClient: NewClient = {
        client_name: this.newClientForm.get('client_name')?.value!,
      };
      this.subscriptionManager.add(
        this.clientService.addClient(newClient).subscribe({
          next: (response: PostgrestSingleResponse<Client[]>) => {
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
            this.isAddClientDialogVisible = false;
            this.fetchAllClients();
            this.toastService.addToast(
              ToastSeverity.SUCCESS,
              toastMessages.SUCCESS.TITLE.ADD_CLIENT,
              toastMessages.SUCCESS.MESSAGE.ADD_CLIENT
            );
          },
        })
      );
    } else {
      this.newClientForm.markAllAsTouched();
    }
  }

  /**
   * Opens a confirmation dialog to delete a publication and its invoices.
   *
   * This function triggers a dialog asking the user to confirm the deletion
   * of a specified publication. If the user accepts, the publication and its
   * associated invoices are deleted. If the user rejects, a cancellation
   * toast message is displayed.
   *
   * @param publication - The publication to be deleted, which includes its
   * name and associated invoices.
   */
  public confirmDeletePublication(publication: Publication): void {
    this.confirmationService.confirm({
      message: `Are you sure that you want to delete publication, <b>${publication.publication_name}</b>, and all of its invoices?`,
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
        this.deletePublication(publication);
      },
    });
  }

  public confirmDeleteClient(client: Client): void {
    this.confirmationService.confirm({
      message: `Are you sure that you want to delete client, <b>${client.client_name}</b>, and all of its invoices?`,
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
        this.deleteClient(client);
      },
    });
  }

  ngOnDestroy(): void {
    this.subscriptionManager.unsubscribe();
  }
}
