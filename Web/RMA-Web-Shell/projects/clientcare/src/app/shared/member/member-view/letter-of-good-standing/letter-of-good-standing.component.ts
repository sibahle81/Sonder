import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ToastrManager } from 'ng6-toastr-notifications';
import { LetterOfGoodStandingService } from 'projects/clientcare/src/app/member-manager/services/letter-of-good-standing.service';
import { BehaviorSubject } from 'rxjs';
import { LetterOfGoodStandingDialogComponent } from './letter-of-good-standing-expiry-date-dialog/letter-of-good-standing-dialog.component';
import { LetterOfGoodStandingDataSource } from './letter-of-good-standing.datasource';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { SsrsReportViewerDialogComponent } from '../../../../../../../shared-components-lib/src/lib/dialogs/ssrs-report-viewer-dialog/ssrs-report-viewer-dialog.component';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { DeclarationService } from 'projects/clientcare/src/app/member-manager/services/declaration.service';
import { PolicyStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-status.enum';
import { LetterOfGoodStanding } from 'projects/clientcare/src/app/policy-manager/shared/entities/letter-of-good-standing';
import { ClientItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/client-item-type-enum';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { GeneralAuditDialogComponent } from '../../../general-audits/general-audit-dialog/general-audit-dialog.component';
import "src/app/shared/extensions/date.extensions";

@Component({
  selector: 'letter-of-good-standing',
  templateUrl: './letter-of-good-standing.component.html',
  styleUrls: ['./letter-of-good-standing.component.css']
})
export class LetterOfGoodStandingComponent extends UnSubscribe implements OnChanges {

  editPermission = 'Generate Adhoc Letter of Good Standing';
  viewPermission = 'View Member';
  viewAuditPermission = 'View Audits';

  @Input() policy: Policy;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  form: any;
  dataSource: LetterOfGoodStandingDataSource;
  currentQuery: any;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isGenerating$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  supportedPolicyStatuses: PolicyStatusEnum[] = [PolicyStatusEnum.Active];

  constructor(
    private readonly letterOfGoodStandingService: LetterOfGoodStandingService,
    private readonly declarationService: DeclarationService,
    private readonly alert: ToastrManager,
    public dialog: MatDialog
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.policy) {
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
      this.dataSource = new LetterOfGoodStandingDataSource(this.letterOfGoodStandingService);
      this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
      this.currentQuery = this.policy.policyOwnerId.toString();
      this.getData();
    }
  }

  getData() {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  sendEmail() {
    this.isLoading$.next(true);
    this.letterOfGoodStandingService.resendLetterOfGoodStanding(this.policy).subscribe(result => {
      result && result === 200 ?
        this.alert.infoToastr('Letter of Good Standing sent successfully...') : this.alert.errorToastr('Letter of Good Standing failed to send...');
      this.isLoading$.next(false);
    });
  }

  generateLetterOfGoodStanding(expiryDate: Date) {
    this.isGenerating$.next(true);
    this.letterOfGoodStandingService.generateLetterOfGoodStanding(expiryDate, this.policy.policyOwnerId, this.policy.policyId).subscribe(result => {
      result ?
        this.alert.infoToastr('Letter of Good Standing generated successfully...') : this.alert.errorToastr('Letter of Good Standing failed to generated...');
      this.getData();
      this.isGenerating$.next(false);
    });
  }

  isValid(issueDate: Date, expiryDate: Date): boolean {
    const _issueDate = new Date(issueDate).getCorrectUCTDate();
    const _expiryDate = new Date(expiryDate).getCorrectUCTDate();
    const today = new Date().getCorrectUCTDate();
    return _expiryDate > today && today >= _issueDate;
  }

  getClass(issueDate: Date, expiryDate: Date): string { 
    const now = new Date();
    const issue = new Date(issueDate);

    if (issue > now) {
      return 'blue';
    }

    return this.isValid(issueDate, expiryDate) ? 'green' : 'red';
  }

  viewLetter() {
    this.isLoading$.next(true);

    let year = (new Date().getCorrectUCTDate()).getFullYear();
    this.declarationService.getDefaultRenewalPeriodStartDate(this.policy.policyOwner.company.industryClass, new Date().getCorrectUCTDate()).subscribe(result => {
      year = new Date(result).getFullYear();
      this.openLetterDialog(year);
      this.isLoading$.next(false);
    });
  }

  openLetterDialog(year: number) {
    const parameters = [
      { key: 'ProductOptionId', value: this.policy.productOptionId },
      { key: 'RolePlayerId', value: this.policy.policyOwnerId },
      { key: 'DeclarationYear', value: year }
    ];

    const dialogRef = this.dialog.open(SsrsReportViewerDialogComponent, {
      width: '70%',
      disableClose: true,
      data: {
        title: 'Letter of Good Standing',
        reporturl: 'RMA.Reports.ClientCare.Policy/LOGS/RMAMemberLetterOfGoodStanding',
        parameters: parameters
      }
    });
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  openLetterOfGoodStandingDialog() {
    const dialogRef = this.dialog.open(LetterOfGoodStandingDialogComponent, {
      width: '40%'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const expiryDate = new Date(result).getCorrectUCTDate();
        this.generateLetterOfGoodStanding(expiryDate);
      }
    });
  }

  getDisplayedColumns() {
    const columnDefinitions = [
      { def: 'issueDate', show: true },
      { def: 'expiryDate', show: true },
      { def: 'certificateNo', show: true },
      { def: 'createdBy', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize > 10 },
      { def: 'createdByConverted', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize <= 10 },
      { def: 'createdDate', show: true },
      { def: 'actions', show: this.userHasPermission(this.viewAuditPermission) }
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  openAuditDialog(letterOfGoodStanding: LetterOfGoodStanding) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.ClientManager,
        clientItemType: ClientItemTypeEnum.LetterOfGoodStanding,
        itemId: letterOfGoodStanding.letterOfGoodStandingId,
        heading: `Letter of Good Standing ${letterOfGoodStanding.certificateNo} Audit`,
        propertiesToDisplay: ['IssueDate', 'ExpiryDate']
      }
    });
  }
}
