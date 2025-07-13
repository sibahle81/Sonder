import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { ClaimLiabilityStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-liability-status.enum';
import { PolicyClaimsDataSource } from './policy-claims.datasource';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { Claim } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/claim.model';
import { EventHolisticViewDialogComponent } from 'projects/member/src/app/member-manager/views/member-home/event-holistic-view-dialog/event-holistic-view-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'policy-claims-v2',
  templateUrl: './policy-claims.component.html',
  styleUrls: ['./policy-claims.component.css']
})
export class PolicyClaimsComponent extends PermissionHelper implements OnChanges {

  @Input() policyId: number;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  form: any;
  dataSource: PolicyClaimsDataSource;
  currentQuery: any;

  constructor(
    private readonly claimService: ClaimCareService,
    public dialog: MatDialog
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.policyId) {
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
      this.dataSource = new PolicyClaimsDataSource(this.claimService);
      this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
      this.currentQuery = this.policyId.toString();
      this.getData();
    }
  }

  getData() {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  getDisplayedColumns() {
    const columnDefinitions = [
      { def: 'policyNumber', show: true },
      { def: 'claimReferenceNumber', show: true },
      { def: 'createdDate', show: true },
      { def: 'claimLiabilityStatus', show: true },
      { def: 'claimStatus', show: true },
      { def: 'actions', show: false }
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  getClaimStatus(claimStatus: ClaimStatusEnum): string {
    return this.formatText(ClaimStatusEnum[claimStatus]);
  }

  getClaimLiabilityStatus(claimLiabilityStatus: ClaimLiabilityStatusEnum): string {
    return this.formatText(ClaimLiabilityStatusEnum[claimLiabilityStatus]);
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  navigate($event: Claim) {
    this.isLoading$.next(true);
    this.claimService.getPersonEventDetails($event.personEventId).subscribe(result => {
      if (result) {
        this.openEventDialog(result.eventId);
      }
      this.isLoading$.next(false);
    });
  }

  openEventDialog(eventId: number) {
    const dialogRef = this.dialog.open(EventHolisticViewDialogComponent, {
      autoFocus: false,
      maxHeight: '90vh',
      width: '80%',
      disableClose: true,
      data: {
        eventId: +eventId
      }
    });
  }
}
