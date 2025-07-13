import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ToastrManager } from 'ng6-toastr-notifications';
import { MatTableDataSource } from '@angular/material/table';
import { PaymentAllocationLookup } from '../../../models/allocation-lookup';
import { AllocationLookupService } from '../../../services/allocation-lookup.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-list-reference-lookups',
  templateUrl: './list-reference-lookups.component.html',
  styleUrls: ['./list-reference-lookups.component.css']
})
export class ListReferenceLookupsComponent implements OnInit {
  paginator: MatPaginator;
  
  backLink = '/fincare/billing-manager';
  allocationLookupList: PaymentAllocationLookup[] = [];
  
  @Input()
  public loadAllReferences: boolean;

  allocationLookupDataSource = new MatTableDataSource<PaymentAllocationLookup>();
  displayedAllocationLookupColumns = ['debtorNumber', 'debtorName', 'userReference'];
  
  constructor(
    private readonly allocationLookupService: AllocationLookupService,
    private readonly toastr: ToastrManager,
    private changeDetectorRef: ChangeDetectorRef) {
  }

  ngAfterViewInit(): void {
    //this.allocationLookupDataSource.rowCount$.subscribe(count => this.paginator.length = count);

    merge(this.paginator.page)
      .pipe(
        tap(() => this.loadData())
      )
      .subscribe();

    this.changeDetectorRef.detectChanges();
  }

  ngOnInit() {
    if (!this.loadAllReferences) {
      this.loadData();
    }
    
    this.loadAllReferences = false;
  }
  
  loadData() {
    this.allocationLookupService.getAllocationLookups()
    .subscribe(existingReferences => {
      if(existingReferences.length > 0) {
        this.allocationLookupDataSource.data = existingReferences;
      }
    },
    error => {
      this.toastr.errorToastr('Error with loading reference lookups: ' + error);
    });
  }

  setControls(paginator: MatPaginator, sort: MatSort, defaultSort = true): void {
    this.paginator = paginator;
  }
}