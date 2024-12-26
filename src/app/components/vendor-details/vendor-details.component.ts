import {Component, inject, OnDestroy, OnInit, signal, WritableSignal} from "@angular/core";
import { IVendor, IVendorDetails } from "../../interfaces/vendor-detail.interface";
import { paginationOptions, sampleVendorDetails } from "../../utils/constants";
import { ButtonModule } from "primeng/button";
import { RippleModule } from "primeng/ripple";
import { ActivatedRoute } from "@angular/router";
import { AgGridAngular } from "ag-grid-angular";
import { GridApi, GridOptions, GridReadyEvent } from "ag-grid-community";
import { formatDate } from "../../utils/helper";
import { formatCurrency } from "@angular/common";

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
})
export class VendorDetailsComponent implements OnInit, OnDestroy {
  public vendor: WritableSignal<IVendor> = signal<IVendor>({} as IVendor);
  public vendorDetails: WritableSignal<IVendorDetails[]> = signal<IVendorDetails[]>([]);

  public isAddInvoiceDialogOpen: boolean = false;

  public gridOptions!: GridOptions;
  private gridApi: GridApi = {} as GridApi;
  private route: ActivatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    const vendorId = this.route.snapshot.params["id"];

    // this.vendor.set(sampleVendors.find((v: IVendor) => v.id === vendorId)!);

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
    // this.vendorDetails.set(sampleVendorDetails);
    // const columns: Column[] = Object.keys(this.vendorDetails()[0]).map(
    //   (key) => ({ field: key, header: key })
    // );
    // this.gridOptions.rowData = this.vendorDetails();
  }

  ngOnDestroy(): void {}
}
