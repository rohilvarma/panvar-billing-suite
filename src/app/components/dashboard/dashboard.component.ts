import { Component, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IVendor } from '../../interfaces/vendor-detail.interface';
import { sampleVendors } from '../../utils/constants';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  public vendorDetails = signal<IVendor[]>([]);

  ngOnInit(): void {
    this.vendorDetails.set(sampleVendors);
  }
}
