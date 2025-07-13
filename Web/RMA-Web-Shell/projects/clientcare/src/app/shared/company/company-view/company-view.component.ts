import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { MemberStatusEnum } from 'projects/shared-models-lib/src/lib/enums/member-status-enum';
import { RequiredDocumentService } from 'projects/admin/src/app/configuration-manager/shared/required-document.service';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { ClientTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/client-type-enum';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';
import { Company } from 'projects/clientcare/src/app/policy-manager/shared/entities/company';
import { IndustryTypeEnum } from 'projects/shared-models-lib/src/lib/enums/industry-type.enum';
import { DebtorStatusEnum } from 'projects/fincare/src/app/shared/enum/debtor-status.enum';
import { CompanyLevelEnum } from 'projects/shared-models-lib/src/lib/enums/company-level-enum';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { QuoteV2 } from '../../../quote-manager/models/quoteV2';
import { QuoteViewDialogComponent } from 'projects/member/src/app/member-manager/views/member-home/quote-view-dialog/quote-view-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'company-view',
  templateUrl: './company-view.component.html',
  styleUrls: ['./company-view.component.css']
})
export class CompanyViewComponent extends UnSubscribe implements OnChanges {
  viewPermission = 'View Company';
  viewAuditPermission = 'View Audits';
  manageLinkedUsersPermission = 'Manage Linked Users';

  @Input() rolePlayer: RolePlayer; // required: pass in new roleplayer object or the rolePlayer(company) you want to view 
  @Input() rolePlayerIdentificationType: RolePlayerIdentificationTypeEnum; // optional
  @Input() tabIndex: number; // optional: sets the default tab
  @Input() defaultPolicyId: number; // optional: sets the default selected policy

  // optional: set to force override the default behavior
  @Input() isReadOnly = false;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  documentSystemName = DocumentSystemNameEnum.RolePlayerDocuments;

  _new = MemberStatusEnum.New;
  holdingCompanyLevel = CompanyLevelEnum.HoldingCompany;
  subsidiaryLevel = CompanyLevelEnum.Subsidiary;

  holdingCompany: RolePlayer;

  rolePlayerContactOptions: KeyValue<string, number>[];

  constructor(
    private readonly requiredDocumentService: RequiredDocumentService,
    private readonly router: Router,
    public dialog: MatDialog
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.rolePlayer) {
      if (!this.rolePlayer.rolePlayerId || this.rolePlayer.rolePlayerId <= 0) {
        this.rolePlayer.company = new Company();
        this.rolePlayer.rolePlayerIdentificationType = this.rolePlayerIdentificationType;
        this.rolePlayer.clientType = ClientTypeEnum.Company;
        this.rolePlayer.memberStatus = MemberStatusEnum.New;
        this.generateRolePlayerId();
      } else if (this.rolePlayer.rolePlayerId > 0) {
        this.rolePlayerContactOptions = [
          { key: 'Member', value: this.rolePlayer.rolePlayerId }
        ];
        this.rolePlayerIdentificationType = this.rolePlayer.rolePlayerIdentificationType;
        this.isLoading$.next(false);
      }
    }
  }

  generateRolePlayerId() {
    this.requiredDocumentService.generateDocumentNumber('RolePlayerId').subscribe(result => {
      this.rolePlayer.rolePlayerId = +result;
      this.isLoading$.next(false);
    });
  }

  openQuoteDialog($event: QuoteV2) {
    const dialogRef = this.dialog.open(QuoteViewDialogComponent, {
      autoFocus: false,
      maxHeight: '90vh',
      width: '80%',
      disableClose: true,
      data: {
        quoteId: +$event.quoteId
      }
    });
  }

  setSelectedSubsidiary($event: Company) {
    this.router.navigate([`/clientcare/member-manager/member-wholistic-view/${$event.rolePlayerId}`]);
  }

  setHoldingCompany($event: RolePlayer) {
    this.holdingCompany = $event;
  }

  navigateToHoldingCompany() {
    if (!this.holdingCompany) { return; }

    if (this.holdingCompany.finPayee) {
      this.router.navigate([`/clientcare/member-manager/member-wholistic-view/${this.holdingCompany.rolePlayerId}`]);
    } else {
      this.router.navigate([`/clientcare/member-manager/holistic-role-player-view/${this.holdingCompany.rolePlayerId}`]);
    }
  }

  getIndustry(industry: IndustryTypeEnum): string {
    return this.formatText(IndustryTypeEnum[industry]);
  }

  getIndustryClass(industryClass: IndustryClassEnum): string {
    return this.formatText(IndustryClassEnum[industryClass]);
  }

  getClientType(clientType: ClientTypeEnum): string {
    return this.formatText(ClientTypeEnum[clientType]);
  }

  getRolePlayerIdentificationType(rolePlayerIdentificationType: RolePlayerIdentificationTypeEnum): string {
    return this.formatText(RolePlayerIdentificationTypeEnum[rolePlayerIdentificationType]);
  }

  getMemberStatus(memberStatus: MemberStatusEnum): string {
    return this.formatText(MemberStatusEnum[memberStatus]);
  }

  getDebtorStatus(debtorStatus: DebtorStatusEnum): string {
    return this.formatText(DebtorStatusEnum[debtorStatus]);
  }

  getCompanyLevel(companyLevel: CompanyLevelEnum): string {
    return this.formatText(CompanyLevelEnum[companyLevel]);
  }

  formatText(text: string): string {
    if (!text) { return ''; }
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }
}
