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
import { Publication } from '../../interfaces/publications';
import { ToastService } from '../../services/toast/toast.service';

import { toastMessages, ToastSeverity } from '../../utils/constants';
import { counterArray } from '../../utils/helper';
import { PublicationService } from '../../services/publication/publication.service';

type NewPublication = {
  name: string;
  publication_name: string;
  email: string;
  user_id?: string;
};

type StateType = {
  label: string;
  value: boolean;
}

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
  public publicationDetails: WritableSignal<Publication[]> = signal<
    Publication[]
  >([]);
  public counterArray = counterArray;
  public isLoadingPublications: boolean = false;
  public isPublicationState: boolean = true;
  public stateOptions: any[] = [
    { label: 'Publications', value: true },
    { label: 'Clients', value: false },
  ];

  public isAddPublicationDialogVisible: boolean = false;
  public newPublicationForm: FormGroup = new FormGroup({
    name: new FormControl(null, [Validators.required]),
    email: new FormControl(null, [Validators.required, Validators.email]),
    publication_name: new FormControl(null, [Validators.required]),
  });

  private subscriptionManager: Subscription = new Subscription();
  private toastService: ToastService = inject(ToastService);
  private confirmationService: ConfirmationService =
    inject(ConfirmationService);
  private publicationService: PublicationService = inject(PublicationService);

  ngOnInit(): void {
    this.fetchAllPublications();
  }

  private fetchAllPublications(): void {
    this.toggleIsLoadingPublications();
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
          this.toggleIsLoadingPublications();
        },
      })
    );
  }

  private toggleIsLoadingPublications(): void {
    this.isLoadingPublications = !this.isLoadingPublications;
  }

  public showAddPublicationDialog(): void {
    this.isAddPublicationDialogVisible = true;
  }

  public addNewPublication(): void {
    if (this.newPublicationForm.valid) {
      const newPublication: NewPublication = {
        name: this.newPublicationForm.get('name')?.value!,
        publication_name:
          this.newPublicationForm.get('publication_name')?.value!,
        email: this.newPublicationForm.get('email')?.value!,
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

  ngOnDestroy(): void {
    this.subscriptionManager.unsubscribe();
  }
}
