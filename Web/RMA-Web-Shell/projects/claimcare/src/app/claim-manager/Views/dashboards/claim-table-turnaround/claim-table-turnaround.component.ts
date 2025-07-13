import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Claim } from '../../../shared/entities/funeral/claim.model';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { ClaimTableTurnaroundDataSource } from './claim-table-turnaround.datasource';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';


@Component({
  selector: 'claim-table-turnaround',
  templateUrl: '../claim-table-dashboard/claim-table-dashboard.component.html',
  styleUrls: ['../claim-table-dashboard/claim-table-dashboard.component.css']
})
export class ClaimTableTurnaroundComponent implements OnInit {


  get isLoading(): boolean { return this.dataSource.isLoading; }
  get isError(): boolean { return this.dataSource.isError; }
  private paginator: MatPaginator;
  private sort: MatSort;

  @ViewChild(MatPaginator, { static: true }) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }
  @ViewChild('filter', { static: false }) filter: ElementRef;

  // Setting up the Datagrid columns
  columnDefinitions: any[] = [
    { display: 'claim Number', def: 'claimNumber', show: true },
    { display: 'Status', def: 'claimStatus', show: true },
    { display: 'Created Date', def: 'createdDate', show: true },
    { display: 'Action', def: 'action', show: true }
  ];

  tableClaims: Claim[];
  hasTableClaims = false;
  heading: string;

  get hasClaims(): boolean {
    if (this.isLoading) { return false; }
    if (!this.dataSource || !this.dataSource.data) { return false; }
    return this.dataSource.data.length > 0;
  }

  constructor(
    protected readonly wizardService: WizardService,
    public dataSource: ClaimTableTurnaroundDataSource,
    private readonly confirmService: ConfirmationDialogsService,
    protected readonly router: Router,
  ) { this.loadLookupLists(); }

  setDataSourceAttributes() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    if (this.paginator && this.sort) {
      this.dataSource.setControls(this.paginator, this.sort);
    }
  }

  loadLookupLists(): void {
  }

  ngOnInit() {
  }

  fillData(claims: Claim[], name: string) {
    this.getDataValues(claims);
    this.tableClaims = claims;
    this.heading = name;
    this.hasTableClaims = true;
  }

  // Setting the data for datagrid
  getDataValues(claims: Claim[]) {
    this.dataSource.setControls(this.paginator, this.sort);
    this.dataSource.clearData();
    this.dataSource.getData(claims);

  }

  hideTable() {
    this.tableClaims = null;
    this.hasTableClaims = false;
  }

  getType(index: number): any {
    const name = ClaimStatusEnum[index];
    switch (name) {
      case ClaimStatusEnum[ClaimStatusEnum.PendingRequirements]:
        return 'Pending Requirements';
      case ClaimStatusEnum[ClaimStatusEnum.PendingPolicyAdmin]:
        return 'Pending Admin';
      case ClaimStatusEnum[ClaimStatusEnum.PendingInvestigations]:
        return 'Pending Investigations';
      default:
        return name;
    }
  }

  getDisplayedColumns(): any[] {
    return this.columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }


  messageAlert(claimNumber: number): void {
    this.confirmService.confirmWithoutContainer(`Claim Number ${claimNumber}`, 'Cant view this claim',
      'Center', 'Center', 'Cancel', null).subscribe(
        result => {
          if (result === true) {
            return;
          }
        });
  }

  onSelect(row: any) {
    this.router.navigate(['/claimcare/claim-manager/claim-view/', row.personEventId, row.policyId]);
  }
}
