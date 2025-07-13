import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { LeadClientStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/leadClientStatusEnum';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { MatDialog } from '@angular/material/dialog';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';
import { MemberStatusEnum } from 'projects/shared-models-lib/src/lib/enums/member-status-enum';
import { RolePlayerBenefitWaitingPeriodEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/roleplayer-benefit-waiting-period.enum';
import { ClientItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/client-item-type-enum';
import { DocumentUploaderDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/document-uploader-dialog/document-uploader-dialog.component';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { ClientTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/client-type-enum';
import { LeadService } from 'projects/clientcare/src/app/lead-manager/services/lead.service';

@Component({
  selector: 'member-details',
  templateUrl: './member-details.component.html',
  styleUrls: ['./member-details.component.css']
})
export class MemberDetailsComponent extends UnSubscribe implements OnInit, OnChanges {

  addPermission = 'Add Member';
  editPermission = 'Edit Member';
  viewAuditPermission = 'View Audits';

  @Input() member: RolePlayer;
  @Input() isReadOnly = false;

  @Output() refreshEmit: EventEmitter<boolean> = new EventEmitter();

  form: UntypedFormGroup;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  rolePlayerBenefitWaitingPeriods: RolePlayerBenefitWaitingPeriodEnum[];

  isEdit: boolean;

  declined = LeadClientStatusEnum.Declined;
  selectedLeadClientStatus: LeadClientStatusEnum;

  allRequiredDocumentsUploaded: boolean;

  clientTypes: ClientTypeEnum[];
  filteredClientTypes: ClientTypeEnum[];
  supportedClientTypes: ClientTypeEnum[] = [ClientTypeEnum.Company, ClientTypeEnum.SoleProprietor, ClientTypeEnum.Trust];

  isSyncLead = false;

  constructor(
    private readonly memberService: MemberService,
    private readonly leadService: LeadService,
    private readonly formBuilder: UntypedFormBuilder,
    public dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    this.getLookups();
  }

  getLookups() {
    this.rolePlayerBenefitWaitingPeriods = this.ToArray(RolePlayerBenefitWaitingPeriodEnum);
    this.clientTypes = this.ToArray(ClientTypeEnum);
    this.filteredClientTypes = this.clientTypes.filter(s => this.supportedClientTypes.includes(+[ClientTypeEnum[s]]));
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      memberNumber: [{ value: null, disabled: true }],
      displayName: [{ value: null, disabled: true }],
      memberStatus: [{ value: null, disabled: true }],
      joinDate: [{ value: null, disabled: true }],
      clientType: [{ value: null, disabled: true }],
      rolePlayerBenefitWaitingPeriod: [{ value: null, disabled: true }],
    });

    this.setForm();
  }

  setForm() {
    this.form.patchValue({
      memberNumber: this.member?.finPayee?.finPayeNumber,
      displayName: this.member.displayName,
      memberStatus: MemberStatusEnum[this.member.memberStatus],
      joinDate: this.member.joinDate ? new Date(this.member.joinDate) : new Date(),
      clientType: this.member && this.member.clientType ? ClientTypeEnum[+this.member.clientType] : null,
      rolePlayerBenefitWaitingPeriod: this.member.rolePlayerBenefitWaitingPeriod ? RolePlayerBenefitWaitingPeriodEnum[this.member.rolePlayerBenefitWaitingPeriod] : null
    });

    this.disableForm();

    this.isLoading$.next(false);
  }

  checkKYC() {
    if (this.member.displayName && this.member.displayName != this.form.controls.displayName.value) {
      this.openDocumentUploaderDialog();
    } else {
      this.save();
    }
  }

  readForm() {
    this.setLeadSync();

    this.member.displayName = this.form.controls.displayName.value;
    this.member.joinDate = new Date(this.form.controls.joinDate.value);
    this.member.rolePlayerBenefitWaitingPeriod = +RolePlayerBenefitWaitingPeriodEnum[this.form.controls.rolePlayerBenefitWaitingPeriod.value];
    this.member.clientType = +ClientTypeEnum[this.form.controls.clientType.value];

    this.form.markAsPristine();
  }

  edit() {
    this.isEdit = true;
    this.enableForm();
  }

  save() {
    this.isLoading$.next(true);

    this.disableForm();
    this.readForm();

    this.memberService.updateMember(this.member).subscribe(result => {
      if (this.isSyncLead) {
        this.syncLead();
      }

      this.isEdit = false;
      this.refreshEmit.emit(true);
      this.isLoading$.next(false);
    });
  }

  syncLead() {
    this.leadService.getLeadByRolePlayerId(this.member.rolePlayerId).subscribe(lead => {
      if (lead) {
        lead.displayName = this.member.displayName;

        if (lead?.company) {
          lead.company.name = this.member.displayName;
          lead.clientType = this.member.clientType;
        }

        this.leadService.updateLead(lead).subscribe(_ => { });
      }
    });
  }

  cancel() {
    this.isEdit = false;
    this.form.reset();
    this.setForm();
  }

  setLeadSync() {
    this.isSyncLead = this.member.displayName.trim().toLowerCase() != this.form.controls.displayName.value.trim().toLowerCase()
      || this.member.clientType != +ClientTypeEnum[this.form.controls.clientType.value];
  }

  disableForm() {
    this.form.controls.displayName.disable();
    this.form.controls.clientType.disable();
    this.form.controls.rolePlayerBenefitWaitingPeriod.disable();
  }

  enableForm() {
    this.form.controls.displayName.enable();
    this.form.controls.clientType.enable();
    this.form.controls.rolePlayerBenefitWaitingPeriod.enable();
  }


  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  openAuditDialog() {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.ClientManager,
        clientItemType: ClientItemTypeEnum.Client,
        itemId: this.member.rolePlayerId,
        heading: 'Member Details Audit',
        propertiesToDisplay: ['DisplayName', 'RolePlayerIdentificationTypeEnum', 'RepresentativeId', 'AccountExecutiveId',
          'RolePlayerBenefitWaitingPeriod', 'ClientType']
      }
    });
  }

  openDocumentUploaderDialog() {
    const dialogRef = this.dialog.open(DocumentUploaderDialogComponent, {
      width: '70%',
      data: {
        title: 'Documents Required (K.Y.C): Member Name Changed',
        documentSystemName: DocumentSystemNameEnum.MemberManager,
        documentSet: DocumentSetEnum.MemberDocumentSet,
        keyName: 'MemberId',
        keyValue: this.member.rolePlayerId && this.member.rolePlayerId > 0 ? this.member.rolePlayerId : null,
        documentTypeFilter: [DocumentTypeEnum.LetterheadConfirmingDetails],
        forceRequiredDocumentTypeFilter: [DocumentTypeEnum.LetterheadConfirmingDetails]
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.allRequiredDocumentsUploaded = result;
      if (this.allRequiredDocumentsUploaded) {
        this.save();
      } else {
        this.cancel()
      }
    });
  }
}
