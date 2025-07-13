import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { UnallocatedBankImportPayment } from '../../models/unallocatedBankImportPayment';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { PremiumListingService } from 'projects/clientcare/src/app/policy-manager/shared/Services/premium-listing.service';
import { Router } from '@angular/router';
import { PremiumPaymentFile } from 'projects/clientcare/src/app/policy-manager/shared/entities/premium-payment-file';
import { BehaviorSubject } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-child-allocation-recon',
  templateUrl: './child-allocation-recon.component.html',
  styleUrls: ['./child-allocation-recon.component.css']
})
export class ChildAllocationReconComponent implements OnInit, AfterViewInit {
  startDate: Date;
  endDate: Date;
  datasource = new MatTableDataSource<PremiumPaymentFile>();
  isLoadingPremiumListing$ = new BehaviorSubject(false);
  form: UntypedFormGroup;
  policyNumber = '';
  searchFailedMessage = '';
  displayedColumns = ['fileName', 'createdDate', 'actions'];
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly premiumListingService: PremiumListingService,
    private router: Router,
  ) { }
  ngOnInit(): void {
    this.endDate = new Date();
    this.startDate = new Date();
    this.createForm();
  }

  ngAfterViewInit() {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  createForm() {
    this.form = this.formBuilder.group({
      policyNumber: [],
      startDate: [],
      endDate: [],
    });
  }

  getPremiumListings() {
    this.searchFailedMessage = '';
    this.isLoadingPremiumListing$.next(true);
    this.startDate = this.form.get('startDate').value;
    this.endDate = this.form.get('endDate').value;
    if (this.form.get('policyNumber').value) {
      this.policyNumber = this.form.get('policyNumber').value;
    }
    this.premiumListingService.getPremiumListingPaymentFilesByDate(this.startDate, this.endDate, this.policyNumber).subscribe(results => {
      if (results && results.length > 0) {
        this.datasource.data = [...results];
        this.isLoadingPremiumListing$.next(false);
      }
      else {
        this.searchFailedMessage = 'no premium listing payment files found using search criteria';
        this.isLoadingPremiumListing$.next(false);
      }
    }, error => { this.isLoadingPremiumListing$.next(false); });
  }

  back() {
    this.router.navigateByUrl('fincare/billing-manager');
  }

  viewReport(fileId: number) {
    this.router.navigate([`../../fincare/billing-manager/view-allocation-results/${fileId}`]);
  }
}
