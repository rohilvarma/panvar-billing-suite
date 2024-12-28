import { formatCurrency } from "@angular/common";
import { Component, inject, OnDestroy, OnInit, signal, WritableSignal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { AgGridAngular } from "ag-grid-angular";
import { GridApi, GridOptions, GridReadyEvent } from "ag-grid-community";
import { ButtonModule } from "primeng/button";
import { RippleModule } from "primeng/ripple";
import { Subscription } from "rxjs";
import { IVendorDetails, Vendor } from "../../interfaces/vendors";
import { ToastService } from "../../services/toast/toast.service";
import { VendorManagementService } from "../../services/vendor-management/vendor-management.service";
import { paginationOptions, ToastSeverity } from "../../utils/constants";
import { formatDate } from "../../utils/helper";

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: "app-vendor-details",
  standalone: true,
  imports: [ButtonModule, RippleModule, AgGridAngular],
  templateUrl: "./vendor-details.component.html",
  styleUrl: "./vendor-details.component.css",
  providers: [ToastService]
})
export class VendorDetailsComponent implements OnInit, OnDestroy {
  public vendor: WritableSignal<Vendor> = signal<Vendor>({} as Vendor);
  public vendorDetails: WritableSignal<IVendorDetails[]> = signal<IVendorDetails[]>([]);

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
    this.vendorId.set(this.route.snapshot.params["id"]);
    this.initialiseGridOptions();
    this.fetchVendorDetails();
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
      columnDefs: [
        {
          field: "invoiceNo",
          headerName: "Invoice No.",
          maxWidth: 150,
        },
        {
          field: "date",
          headerName: "Date",
          valueFormatter: (params) => {
            return formatDate(params.value);
          },
          maxWidth: 150,
        },
        {
          field: "RONumber",
          headerName: "RO Number",
          maxWidth: 150,
        },
        {
          field: "RODate",
          headerName: "RO Date",
          valueFormatter: (params) => {
            return formatDate(params.value);
          },
          maxWidth: 150,
        },
        {
          field: "amount",
          headerName: "Amount",
          valueFormatter: (params) => {
            return formatCurrency(params.value, "en-IN", "Rs. ");
          },
          maxWidth: 150,
        },
        {
          field: "description",
          headerName: "Description",
        },
      ],
      onGridReady: (params: GridReadyEvent) => {
        this.gridApi = params.api;
      },
    };
  }

  private fetchVendorDetails(): void {
    this.subscriptionManager.add(
      this.vendorManagementService.getVendorById(this.vendorId()).subscribe((response: PostgrestSingleResponse<Vendor>) => {
        const { data, error } = response;
        if (data) {          
          this.vendor.set(data);
        } else {
          this.router.navigate(["/"]);
          this.toastService.addToast(
            ToastSeverity.ERROR,
            error.name,
            error.message,
            error.code
          );
        }
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptionManager.unsubscribe();
  }
}
