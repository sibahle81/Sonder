import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { BehaviorSubject } from 'rxjs';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { LeadItemTypeEnum } from 'projects/clientcare/src/app/broker-manager/models/enums/lead-item-type.enum';
import { LeadContactV2DataSource } from './lead-contact-V2.datasource';
import { CommunicationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/communication-type-enum';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { LeadClientStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/leadClientStatusEnum';
import { Lead } from 'projects/clientcare/src/app/lead-manager/models/lead';
import { LeadContactV2 } from 'projects/clientcare/src/app/lead-manager/models/lead-contact-V2';
import { LeadService } from 'projects/clientcare/src/app/lead-manager/services/lead.service';
import { DefaultConfirmationDialogComponent } from '../dialogs/default-confirmation-dialog/default-confirmation-dialog.component';

@Component({
  selector: 'lead-contact-V2',
  templateUrl: './lead-contact-V2.component.html',
  styleUrls: ['./lead-contact-V2.component.css']
})
export class LeadContactV2Component extends UnSubscribe implements OnChanges {

  addPermission = 'Add Lead';
  editPermission = 'Edit Lead';
  viewPermission = 'View Lead';

  @Input() lead: Lead;

  //Optional
  @Input() isReadOnly = false;
  @Input() isSelectionMode = false;
  @Input() supportedPreferredCommunicationTypes = [CommunicationTypeEnum.Email, CommunicationTypeEnum.Phone, CommunicationTypeEnum.Post, CommunicationTypeEnum.SMS];

  @Output() selectedContactsEmit: EventEmitter<LeadContactV2[]> = new EventEmitter();
  @Output() isCompletedEmit: EventEmitter<boolean> = new EventEmitter();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  form: UntypedFormGroup;
  dataSource: LeadContactV2DataSource;
  currentQuery: any;

  selectedLeadContactV2: LeadContactV2;
  selectedLeadContactV2s: LeadContactV2[];

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showForm$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showDetail$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  requiredAuditPermission = 'View Audits';
  hasAuditPermission = false;

  communicationTypes: CommunicationTypeEnum[];
  filteredCommunicationTypes: CommunicationTypeEnum[];

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    private readonly leadService: LeadService,
    public dialog: MatDialog
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.hasAuditPermission = userUtility.hasPermission(this.requiredAuditPermission);
    this.getLookups();
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource = new LeadContactV2DataSource(this.leadService);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

    if (this.lead && this.lead.leadId > 0) {
      this.currentQuery = this.lead.leadId.toString();
      this.getData();
    }
  }

  getLookups() {
    this.communicationTypes = this.ToArray(CommunicationTypeEnum);
    this.filteredCommunicationTypes = this.communicationTypes.filter(s => this.supportedPreferredCommunicationTypes.includes(+CommunicationTypeEnum[s]));

    this.createForm();
  }

  getData() {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  close() {
    this.showDetail$.next(false);
    this.showForm$.next(false);
    this.reset();
  }

  createForm() {
    if (!this.form) {
      this.form = this.formBuilder.group({
        name: [{ value: null, disabled: false }, [Validators.required]],
        surname: [{ value: null, disabled: false }, [Validators.required]],
        emailAddress: [{ value: null, disabled: false }, [Validators.required]],
        contactNumber: [{ value: null, disabled: false }],
        telephoneNumber: [{ value: null, disabled: false }],
        preferredCommunicationType: [{ value: null, disabled: false }, [Validators.required]],
      });
    }
  }

  setForm(leadContactV2: LeadContactV2) {
    this.form.patchValue({
      name: leadContactV2.name ? leadContactV2.name : null,
      surname: leadContactV2.surname ? leadContactV2.surname : null,
      emailAddress: leadContactV2.emailAddress ? leadContactV2.emailAddress : null,
      contactNumber: leadContactV2.contactNumber ? leadContactV2.contactNumber : null,
      telephoneNumber: leadContactV2.telephoneNumber ? leadContactV2.telephoneNumber : null,
      preferredCommunicationType: leadContactV2.preferredCommunicationTypeId ? CommunicationTypeEnum[+leadContactV2.preferredCommunicationTypeId] : null,
    });
  }

  readForm(): LeadContactV2 {
    const leadContactV2 = new LeadContactV2();

    leadContactV2.contactId = this.selectedLeadContactV2 && this.selectedLeadContactV2.contactId && this.selectedLeadContactV2.contactId > 0 ? this.selectedLeadContactV2.contactId : 0;
    leadContactV2.leadId = this.lead.leadId;
    leadContactV2.name = this.form.controls.name.value;
    leadContactV2.surname = this.form.controls.surname.value;
    leadContactV2.emailAddress = this.form.controls.emailAddress.value;
    leadContactV2.contactNumber = this.form.controls.contactNumber.value;
    leadContactV2.telephoneNumber = this.form.controls.telephoneNumber.value;
    leadContactV2.preferredCommunicationTypeId = +CommunicationTypeEnum[this.form.controls.preferredCommunicationType.value];

    if (this.lead.leadId <= 0) {
      const currentUser = this.authService.getCurrentUser();
      leadContactV2.createdBy = currentUser.email;
      leadContactV2.createdDate = new Date();
      leadContactV2.modifiedBy = currentUser.email;
      leadContactV2.modifiedDate = new Date();
    }

    return leadContactV2;
  }

  showForm(leadContactV2: LeadContactV2, enableForm: boolean) {
    if (leadContactV2) {
      this.selectedLeadContactV2 = leadContactV2;
      this.setForm(leadContactV2);
    }

    if (enableForm) {
      this.form.enable();
    } else {
      this.form.disable();
    }

    this.showForm$.next(true);
  }

  save() {
    this.isLoading$.next(true);
    const leadContactV2 = this.readForm();
    if (leadContactV2.emailAddress.toLowerCase().includes('@randmutual')) {
      this.openConfirmationDialog();
    } else {
      if (this.selectedLeadContactV2) {
        this.edit(leadContactV2);
      } else {
        this.add(leadContactV2);
      }
    }
  }

  openConfirmationDialog() {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: `Restricted Lead Contact Email Address`,
        text: `Randmutual email addresses are not valid for lead contacts`
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.form.controls.emailAddress.reset();
      this.form.controls.emailAddress.markAsTouched();
      this.form.controls.emailAddress.updateValueAndValidity();
      this.isLoading$.next(false);
    });
  }

  add(leadContactV2: LeadContactV2) {
    if (this.lead.leadId > 0) {
      this.leadService.addLeadContactV2(leadContactV2).subscribe(result => {
        this.getData();
        this.reset();
        this.showForm$.next(false);
        this.isLoading$.next(false);
      });
    } else if (this.lead.leadId <= 0) {
      if (!this.lead.contactV2) {
        this.lead.contactV2 = [];
      }
      this.lead.contactV2.push(leadContactV2);
      this.dataSource.getWizardData(this.lead.contactV2);
      this.reset();

      if (this.lead.leadClientStatus == LeadClientStatusEnum.New) {
        this.isCompletedEmit.emit(true);
      }

      this.showForm$.next(false);
      this.isLoading$.next(false);
    }
  }

  edit(leadContactV2: LeadContactV2) {
    if (this.lead.leadId > 0) {
      this.leadService.editLeadContactV2(leadContactV2).subscribe(result => {
        this.getData();
        this.reset();

        if (this.lead.leadClientStatus == LeadClientStatusEnum.New) {
          this.isCompletedEmit.emit(true);
        }

        this.showForm$.next(false);
        this.isLoading$.next(false);
      });
    } else if (this.lead.leadId <= 0) {
      if (!this.lead.contactV2) {
        this.lead.contactV2 = [];
      }
      const index = this.lead.contactV2.findIndex(s => s == this.selectedLeadContactV2)
      if (index > -1) {
        this.lead.contactV2[index] = leadContactV2;
        this.dataSource.getWizardData(this.lead.contactV2);
        this.reset();

        if (this.lead.leadClientStatus == LeadClientStatusEnum.New) {
          this.isCompletedEmit.emit(true);
        }

        this.showForm$.next(false);
        this.isLoading$.next(false);
      }
    }
  }

  delete(leadContact: LeadContactV2) {
    const index = this.lead.contactV2.findIndex(s => s == leadContact)
    if (index > -1) {
      this.lead.contactV2.splice(index, 1);
      this.dataSource.getWizardData(this.lead.contactV2);
    }
  }

  getCommunicationType(communicationType: CommunicationTypeEnum): string {
    return this.formatLookup(CommunicationTypeEnum[+communicationType]);
  }

  communicationTypeChanged(communicationType: CommunicationTypeEnum) {
    this.clearValidationToFormControl(this.form, 'contactNumber');
    this.clearValidationToFormControl(this.form, 'telephoneNumber');

    switch (+CommunicationTypeEnum[communicationType]) {
      case CommunicationTypeEnum.Phone:
        this.applyValidationToFormControl(this.form, Validators.required, 'telephoneNumber');
        break;

      case CommunicationTypeEnum.SMS:
        this.applyValidationToFormControl(this.form, Validators.required, 'contactNumber');
        break;

      default:
        break;
    }
  }

  clearValidationToFormControl(form: UntypedFormGroup, controlName: string) {
    form.get(controlName).clearValidators();
    form.get(controlName).markAsTouched();
    form.get(controlName).updateValueAndValidity();
  }

  contactSelected(contact: LeadContactV2) {
    if (this.isSelectionMode) {
      if (!this.selectedLeadContactV2s) { this.selectedLeadContactV2s = []; }

      let index = this.selectedLeadContactV2s.findIndex(a => a.contactId === contact.contactId);
      if (index > -1) {
        this.selectedLeadContactV2s.splice(index, 1);
      } else {
        this.selectedLeadContactV2s.push(contact);
      }
      this.selectedContactsEmit.emit(this.selectedLeadContactV2s);
    }
  }

  applyValidationToFormControl(form: UntypedFormGroup, validationToApply: any, controlName: string) {
    form.get(controlName).setValidators(validationToApply);
    form.get(controlName).markAsTouched();
    form.get(controlName).updateValueAndValidity();
  }

  reset() {
    this.form.controls.name.reset();
    this.form.controls.surname.reset();
    this.form.controls.emailAddress.reset();
    this.form.controls.contactNumber.reset();
    this.form.controls.telephoneNumber.reset();
    this.form.controls.preferredCommunicationType.reset();
    this.selectedLeadContactV2 = null;
  }

  getDisplayedColumns() {
    const columnDefinitions = [
      { def: 'select', show: this.isSelectionMode },
      { def: 'contact', show: true },
      { def: 'emailAddress', show: true },
      { def: 'contactNumber', show: true },
      { def: 'telephoneNumber', show: true },
      { def: 'preferredCommunicationTypeId', show: true },
      { def: 'actions', show: true }
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
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

  openAuditDialog(contact: LeadContactV2) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '1024px',
      data: {
        serviceType: ServiceTypeEnum.LeadManager,
        clientItemType: LeadItemTypeEnum.ContactV2,
        itemId: contact.contactId,
        heading: 'Contact Details Audit',
        propertiesToDisplay: ['Name', 'Surname', 'EmailAddress', 'ContactNumber', 'TelephoneNumber', 'PreferredCommunicationTypeId']
      }
    });
  }

}
