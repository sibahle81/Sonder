import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ClaimPagedHearingDataSource } from './claim-paged-hearing.datasource';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PagedParams } from '../../../entities/personEvent/paged-parameters';
import { ClaimDisabilityTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-disabiity-type-enum';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { DefaultConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AssessmentTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/AssessmentTypeEnum';
import { ClaimDisabilityDialogComponent } from '../claim-disability-dialog/claim-disability-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ClaimDisabilityAssessment } from '../../../entities/claim-disability-assessment';
import { ClaimHearingAssessment } from '../../../entities/claim-hearing-assessment';
import { AccidentService } from '../../../../Services/accident.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ClaimDisabilityService } from '../../../../Services/claim-disability.service';

@Component({
  selector: 'claim-paged-hearing',
  templateUrl: './claim-paged-hearing.component.html',
  styleUrls: ['./claim-paged-hearing.component.css']
})
export class ClaimPagedHearingComponent extends UnSubscribe implements OnChanges {

  @Input() user: User;
  @Input() personEvent: PersonEventModel;
  @Input() disabilityType: ClaimDisabilityTypeEnum;
  @Input() event: ClaimDisabilityAssessment;
  @Input() query: ClaimDisabilityTypeEnum;

  @Output() refreshClaimEmit: EventEmitter<boolean> = new EventEmitter();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  dataSource: ClaimPagedHearingDataSource;
  menus: { title: string; url: string; disable: boolean }[];
  params = new PagedParams();
  currentQuery = '';
  canAddPermission = false;
  canSendPermission = false;
  claimHearingAssessment: ClaimHearingAssessment;

  constructor(
    private readonly claimDisabilityService: ClaimDisabilityService,
    public dialog: MatDialog,
    private readonly alertService: ToastrManager,
    private readonly claimAccidentService: AccidentService,
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.personEvent) {
      this.setPaginatorOnSortChanges();
      this.dataSource.personEventId = this.personEvent.personEventId;
      this.getData();
    }
  }

  getDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'assessmentType', show: true },
      { def: 'assessmentDate', show: true },
      { def: 'assessedByUserId', show: true },
      { def: 'percentageHL', show: true },
      { def: 'awardedPHL', show: true },
      { def: 'createdBy', show: false },
      { def: 'actions', show: true },
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  setPaginatorOnSortChanges() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource = new ClaimPagedHearingDataSource(this.claimDisabilityService);
    this.dataSource.rowCount$.subscribe((count) => this.paginator.length = count);
  }

  getData() {
    this.setParams();
    this.dataSource.getData(this.params.pageIndex, this.params.pageSize, this.params.orderBy, this.params.direction, this.params.currentQuery);
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  setParams() {
    this.params.pageIndex = this.paginator.pageIndex ? this.paginator.pageIndex + 1 : 1;
    this.params.pageSize = this.paginator.pageSize ? this.paginator.pageSize : 5;
    this.params.orderBy = this.sort.active && this.sort.active !== undefined ? this.sort.active : 'createdDate';
    this.params.direction = this.sort.direction ? this.sort.direction : 'desc';
    this.params.currentQuery = this.currentQuery ? this.currentQuery : '';
  }

  showDetail($event: ClaimHearingAssessment, actionType: any, isReadOnly: boolean) {
    const dialogRef = this.dialog.open(ClaimDisabilityDialogComponent, {
      width: '80%',
      maxHeight: '700px',
      disableClose: true,
      data: {
        isReadOnly: isReadOnly,
        disabilityType: ClaimDisabilityTypeEnum[ClaimDisabilityTypeEnum.HearingAssessment],
        claimDisability: new ClaimHearingAssessment(),
        personEvent: this.personEvent,
        user: this.user,
        claimHearingAssessment: $event,
        actionType: actionType,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refresh();
        this.disabilityTypeChanged(this.disabilityType);
      }
    });
  }

  onRemove($event: ClaimHearingAssessment, actionType: any) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: `Remove Hearing Assessment`,
        text: `Are you sure you want to remove hearing assessment?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading$.next(true);
        this.claimHearingAssessment = $event;
        this.claimHearingAssessment.isActive = false;
        this.claimHearingAssessment.modifiedBy = this.user.email.toLocaleLowerCase();
        this.claimHearingAssessment.modifiedDate = new Date().getCorrectUCTDate();
        this.claimAccidentService.updateClaimHearingAssessment(this.claimHearingAssessment).subscribe(result => {
          if (result) {
            this.alertService.successToastr('Hearing assessment has been deleted successfully', 'success', true);
            this.getData();
            this.isLoading$.next(false);
          }
        });
      }
    });
  }

  refresh() {
    this.getData();
    this.refreshClaimEmit.emit(true);
  }

  disabilityTypeChanged($event: ClaimDisabilityTypeEnum) {
    this.disabilityType = $event;
    this.canAddPermission = false;
    this.canSendPermission = false;

    switch (this.disabilityType) {
      case ClaimDisabilityTypeEnum.HearingAssessment:
        this.canAddPermission = true;
        this.canSendPermission = true;
        break;
      default:
        break;
    }
  }

  getHearingAssessmentType(id: number) {
    return this.formatText(AssessmentTypeEnum[id]);
  }
}
