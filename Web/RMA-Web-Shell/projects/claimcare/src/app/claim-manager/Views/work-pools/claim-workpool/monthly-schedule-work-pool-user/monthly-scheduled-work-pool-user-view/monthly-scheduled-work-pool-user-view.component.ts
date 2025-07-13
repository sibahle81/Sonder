import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MonthlyScheduledWorkPoolUserViewDatasource } from './monthly-scheduled-work-pool-user-viewDatasource';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { BehaviorSubject } from 'rxjs';
import { MonthlyScheduledWorkPoolUser } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/monthly-scheduled-work-pool-user';

@Component({
  selector: 'monthly-scheduled-work-pool-user-view',
  templateUrl: './monthly-scheduled-work-pool-user-view.component.html',
  styleUrls: ['./monthly-scheduled-work-pool-user-view.component.css']
})
export class MonthlyScheduledWorkPoolUserViewComponent implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('loading Scheduled users...please wait');
  
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource: MonthlyScheduledWorkPoolUserViewDatasource;
  monthlyScheduledWorkPoolUser: MonthlyScheduledWorkPoolUser; 
  form: UntypedFormGroup;
  constructor(
    public formBuilder: FormBuilder,
    public claimCareService: ClaimCareService,
  ) { }

  ngOnInit(): void {
    this.createForm();
    this.setPagination();
    this.getData();
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      filter: new UntypedFormControl(''),
      filterUser: new UntypedFormControl(''),
    });
  }

  getDisplayedColumns() {
    const columnDefinitions = [
        { def: 'AssignedToUser', show: true },
        { def: 'CreatedBy', show: true },
        { def: 'CreatedDate', show: true },
        { def: 'ModifiedBy', show: true },
        { def: 'ModifiedDate', show: true }
    ];
    return columnDefinitions
        .filter(cd => cd.show)
        .map(cd => cd.def);
  }
  setPagination() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource = new MonthlyScheduledWorkPoolUserViewDatasource(this.claimCareService);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
  }
  getData() {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction);
  }
}
