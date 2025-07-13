import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Lead } from '../../../models/lead';
import { BehaviorSubject } from 'rxjs';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LeadService } from '../../../services/lead.service';
import { ClientTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/client-type-enum';
import { LeadClientStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/leadClientStatusEnum';
import { LeadSourceEnum } from 'projects/shared-models-lib/src/lib/enums/lead-source.enum';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { LeadItemTypeEnum } from 'projects/clientcare/src/app/broker-manager/models/enums/lead-item-type.enum';
import { MatDialog } from '@angular/material/dialog';
import { UserSearchDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/user-search-dialog/user-search-dialog.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';

@Component({
  selector: 'lead-details',
  templateUrl: './lead-details.component.html',
  styleUrls: ['./lead-details.component.css']
})
export class LeadDetailsComponent extends UnSubscribe implements OnInit, OnChanges {

  addPermission = 'Add Lead';
  editPermission = 'Edit Lead';
  viewPermission = 'View Lead';

  @Input() leadId: number;
  @Input() source = LeadSourceEnum.Internal; // default is internal unless overwridden by input
  @Input() isReadOnly = false;

  @Output() leadEmit: EventEmitter<Lead> = new EventEmitter();

  form: UntypedFormGroup;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  lead: Lead;

  clientTypes: ClientTypeEnum[];
  filteredClientTypes: ClientTypeEnum[];
  supportedClientTypes: ClientTypeEnum[] = [ClientTypeEnum.Company, ClientTypeEnum.SoleProprietor, ClientTypeEnum.Trust];
  leadClientStatuses: LeadClientStatusEnum[];
  leadSources: LeadSourceEnum[];

  code: string;
  isEdit: boolean;

  declined = LeadClientStatusEnum.Declined;
  selectedLeadClientStatus: LeadClientStatusEnum;

  currentUser: User;

  constructor(
    private readonly leadService: LeadService,
    private readonly memberService: MemberService,
    private readonly authService: AuthService,
    private readonly formBuilder: UntypedFormBuilder,
    public dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    this.getLookups();
  }

  getLookups() {
    this.clientTypes = this.ToArray(ClientTypeEnum);
    this.filteredClientTypes = this.clientTypes.filter(s => this.supportedClientTypes.includes(+[ClientTypeEnum[s]]));
    this.leadClientStatuses = this.ToArray(LeadClientStatusEnum);
    this.leadSources = this.ToArray(LeadSourceEnum);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.leadId && this.leadId > 0) {
      this.getLead();
    } else {
      this.createForm();
    }
  }

  getLead() {
    this.leadService.getLead(this.leadId).subscribe(result => {
      this.lead = result;
      this.getMember();
    });
  }

  getMember() {
    this.memberService.getMember(this.lead.rolePlayerId).subscribe(result => {
      this.lead.isConverted = result ? true : false;
      this.lead.rolePlayer = result;

      this.leadEmit.emit(this.lead);
      this.createForm();
    });
  }

  createForm() {
    this.currentUser = this.authService.getCurrentUser();

    this.form = this.formBuilder.group({
      leadCode: [{ value: this.lead && this.lead.leadId > 0 ? this.lead.code : null, disabled: true }],
      clientType: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      displayName: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      leadClientStatus: [{ value: null, disabled: this.isReadOnly || !this.leadId }, Validators.required],
      declineReason: [{ value: null, disabled: this.isReadOnly || !this.leadId }, [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      receivedDate: [{ value: null, disabled: true }, Validators.required],
      leadSource: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      lastActivityDate: [{ value: null, disabled: true }],
      assignedTo: [{ value: null, disabled: true }]
    });

    this.setForm();
  }

  setForm() {
    this.form.patchValue({
      leadCode: this.lead && this.lead.code ? this.lead.code : this.code,
      clientType: this.lead && this.lead.clientType ? ClientTypeEnum[+this.lead.clientType] : null,
      displayName: this.lead && this.lead.clientType ? this.lead.displayName : null,
      leadClientStatus: this.lead && this.lead.leadClientStatus ? LeadClientStatusEnum[+this.lead.leadClientStatus] : LeadClientStatusEnum[+LeadClientStatusEnum.New],
      declineReason: this.lead && this.lead.declineReason ? this.lead.declineReason : null,
      receivedDate: this.lead && this.lead.receivedDate ? this.lead.receivedDate : new Date(),
      leadSource: this.lead && this.lead.leadSource ? LeadSourceEnum[+this.lead.leadSource] : LeadSourceEnum[+this.source],
      lastActivityDate: this.lead && this.lead.modifiedDate ? this.lead.modifiedDate : new Date(),
      assignedTo: this.lead && this.lead.leadId > 0 ? this.lead.assignedTo : this.currentUser.email
    });

    this.selectedLeadClientStatus = this.lead && this.lead.leadId > 0 ? +this.lead.leadClientStatus : LeadClientStatusEnum.New;

    this.disableForm();

    this.isLoading$.next(false);
  }

  readForm() {
    if (!this.lead) {
      this.lead = new Lead();
    }

    this.lead.leadId = this.lead && this.lead.leadId ? this.lead.leadId : 0;
    this.lead.code = this.form.controls.leadCode.value;
    this.lead.clientType = +ClientTypeEnum[this.form.controls.clientType.value];
    this.lead.displayName = this.form.controls.displayName.value;
    this.lead.leadClientStatus = +LeadClientStatusEnum[this.form.controls.leadClientStatus.value];
    this.lead.declineReason = +LeadClientStatusEnum[this.form.controls.leadClientStatus.value] === LeadClientStatusEnum.Active ? null : this.form.controls.declineReason.value;
    this.lead.receivedDate = new Date(this.form.controls.receivedDate.value);
    this.lead.leadSource = +LeadSourceEnum[this.form.controls.leadSource.value];
    this.lead.assignedTo = this.form.controls.assignedTo.value;

    this.form.markAsPristine();
  }

  edit() {
    this.isEdit = true;
    this.enableForm();
  }

  save() {
    this.disableForm();
    this.readForm();

    if (this.lead.leadId > 0) {
      this.isLoading$.next(true);
      this.leadService.updateLead(this.lead).subscribe(result => {
        this.isEdit = false;
        this.leadEmit.emit(this.lead);
        this.isLoading$.next(false);
      });
    } else {
      this.leadEmit.emit(this.lead);
    }
  }

  cancel() {
    this.isEdit = false;
    this.form.reset();
    this.setForm();
  }

  disableForm() {
    if (this.lead && this.lead.leadId > 0) {
      this.form.controls.clientType.disable();
      this.form.controls.displayName.disable();
      this.form.controls.leadSource.disable();
      this.form.controls.leadClientStatus.disable();
      this.form.controls.declineReason.disable();
    }
  }

  enableForm() {
    this.form.controls.leadSource.enable();
    this.form.controls.leadClientStatus.enable();
  }

  statusChanged(leadClientStatus: LeadClientStatusEnum) {
    this.selectedLeadClientStatus = +LeadClientStatusEnum[leadClientStatus];
    if (this.selectedLeadClientStatus === LeadClientStatusEnum.Declined) {
      this.form.controls.declineReason.enable();
    }
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

  openUserSearchDialog() {
    const dialogRef = this.dialog.open(UserSearchDialogComponent, {
      width: '70%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.form.patchValue({
          assignedTo: result.email
        });

        this.form.markAsDirty();
        this.form.updateValueAndValidity();
      }
    });
  }

  openAuditDialog() {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.LeadManager,
        clientItemType: LeadItemTypeEnum.Lead,
        itemId: this.leadId,
        heading: 'Lead Details Audit',
        propertiesToDisplay: ['Code', 'ClientType', 'DisplayName', 'ReceivedDate', 'LeadClientStatus', 'LeadSource']
      }
    });
  }

}
