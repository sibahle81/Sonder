import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ClaimDisabilityTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-disabiity-type-enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { BehaviorSubject } from 'rxjs';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { ClaimInvoiceService } from '../../../../services/claim-invoice.service';
import { PagedParams } from '../../../entities/personEvent/paged-parameters';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { PdAward } from './PdAward';
import { PdAwardDataSource } from './claim-pdlumpsum-award.datasource';
import { ClaimEarningService } from '../../../../Services/claim-earning.service';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { InvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/invoice-status-enum';
import { PdAwardPaymentComponent } from './pd-award-payment/pd-award-payment.component';
import { ClaimDisabilityAssessment } from '../../../entities/claim-disability-assessment';
import { ClaimHearingAssessment } from '../../../entities/claim-hearing-assessment';

@Component({
  selector: 'claim-pdlumpsum-award',
  templateUrl: './claim-pdlumpsum-award.component.html',
  styleUrls: ['./claim-pdlumpsum-award.component.css']
})
export class ClaimPdlumpsumAwardComponent extends PermissionHelper implements OnChanges {

  @Input() user: User;
  @Input() personEvent: PersonEventModel;
  @Input() event: PdAward;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  @Output() refreshLoading = new EventEmitter<boolean>();
  @Output() disabilityTypeEmit: EventEmitter<ClaimDisabilityTypeEnum> = new EventEmitter();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  query: ClaimDisabilityTypeEnum;
  currentQuery ='';
  dataSource: PdAwardDataSource;
  menus: { title: string; url: string; disable: boolean }[];
  params = new PagedParams();
  approved = ClaimStatusEnum.Approved;
  requestPaymentPermission = 'Request Payment';

  constructor(
    public dialog: MatDialog,
    public userService: UserService,
    private readonly claimInvoiceService: ClaimInvoiceService,
    private readonly confirmService: ConfirmationDialogsService,
    protected claimEarningService: ClaimEarningService,
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource = new PdAwardDataSource(this.claimInvoiceService);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
    this.dataSource.personEventId = this.personEvent.personEventId;
    this.getData();
  }

  getData() {
    this.setParams();
    this.dataSource.getData(this.params.pageIndex, this.params.pageSize, this.params.orderBy, this.params.direction, this.params.currentQuery)
  }

  setParams() {
    this.params.pageIndex = this.paginator.pageIndex ? this.paginator.pageIndex + 1 : 1;
    this.params.pageSize = this.paginator.pageSize ? this.paginator.pageSize : 5;
    this.params.orderBy = this.sort.active && this.sort.active !== undefined ? this.sort.active : 'createdDate';
    this.params.direction = this.sort.direction ? this.sort.direction : 'desc';
    this.params.currentQuery = this.currentQuery ? this.currentQuery : '';
  }

  getDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'authorised', show: false },
      { def: 'payee', show: true },
      { def: 'awardPercentage', show: true },
      { def: 'awardAmount', show: true },
      { def: 'awardStatus', show: true },
      { def: 'createdBy', show: false },
      { def: 'createdDate', show: true },
      { def: 'status', show: true },
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  formatText(text: string): string {
    return text && text.length > 0 ? text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim() : 'No data';
  }

  AddCheckedItems($event: any) {
    if ($event > -1) { }
  };

  disabilityTypeChanged($event: ClaimDisabilityTypeEnum) {
    this.query = $event;
    this.disabilityTypeEmit.emit($event);
  }

  getclaimInvoiceStatus(id: number) {
    if (!id) { return };
    return this.formatText(InvoiceStatusEnum[id]);
  }

  filterMenu(item: any) {
    this.menus = [];
    if (this.userHasPermission(this.requestPaymentPermission) && item.awardStatusId === InvoiceStatusEnum.Captured
      && (item.awardPercentage > 10 || item.awardPercentage < 11)) {
      this.menus = [
        { title: 'Request Payment', url: '', disable: false },
      ];
    }
    else {
      this.menus = [
        { title: 'Form Letters', url: '', disable: false },
        { title: 'History', url: '', disable: false },
      ];
    }
  }

  onMenuItemClick(item: PdAward, menu: any): void {
    switch (menu.title) {
      case 'Request Payment':
        this.openPDAwardPaymentRequestDialog(item);
        break;
      case 'Form Letters':
        break;
      case 'History':
        break;
    }
  }

  openPDAwardPaymentRequestDialog(pdLumpsumAward: PdAward) {
    const dialogRef = this.dialog.open(PdAwardPaymentComponent, {
      width: '50%',
      maxHeight: '700px',
      disableClose: true,
      data: {
        amount: pdLumpsumAward.claimInvoice.invoiceAmount,
        payee: pdLumpsumAward.payeeId,
        vatAmount: pdLumpsumAward.claimInvoice.invoiceVat,
        payeAmount: pdLumpsumAward.claimInvoice.claimAmount,
        invoiceTotal: pdLumpsumAward.claimInvoice.invoiceAmount,
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading$.next(true);
        this.claimInvoiceService.approvePDLumpsumAward(pdLumpsumAward).subscribe(result => {
          if (result) {
            this.refresh();
          }
          this.isLoading$.next(false);
        })
      }
    });
  }

  refresh() {
    this.getData();
  }

  getDisabilityType() {
    switch (+ClaimDisabilityTypeEnum[this.query]) {
      case ClaimDisabilityTypeEnum.DisabilityAssessment:
        return new ClaimDisabilityAssessment();
      case ClaimDisabilityTypeEnum.PDLumpAward:
        return new PdAward();
      case ClaimDisabilityTypeEnum.HearingAssessment:
        return new ClaimHearingAssessment();
      default:
        break;
    }
  }

  onRemove($event: any, actionType: any) {
    this.confirmService.confirmWithoutContainer('Remove PD Lumpsum Award', 'Are you sure you want to remove PD Lumpsum Award?'
      , 'Center', 'Center', 'Yes', 'No').subscribe(result => {
          if (result) {
          }
        });
  }
}
