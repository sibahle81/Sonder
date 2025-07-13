import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { DeclarationService } from 'projects/clientcare/src/app/member-manager/services/declaration.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { MatDialog } from '@angular/material/dialog';
import { MemberWhatappContactDialogComponent } from '../member-whatapp-contact-dialog/member-whatapp-contact-dialog.component';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { CommunicationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/communication-type-enum';
import { RolePlayerContact } from '../../../models/roleplayer-contact';
import { ContactInformationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/contact-information-type-enum';

@Component({
  selector: 'member-whatsapp-list',
  templateUrl: './member-whatsapp-list.component.html',
  styleUrls: ['./member-whatsapp-list.component.css']
})
export class MemberWhatsappListComponent implements OnInit, OnChanges {
  @Input() rolePlayers: RolePlayer[];
  @Input() isWizard: boolean;
  @Input() isReadOnly: boolean;

  form: UntypedFormGroup;
  industryClasses: any[] = [];
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  selectedIndustryClassId: number;

  SMSCommunicationType = CommunicationTypeEnum.SMS;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    public declarationService: DeclarationService,
    private readonly alertService: AlertService,
    private readonly wizardService: WizardService,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.getLookups();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getLookups();
  }

  getLookups() {
    this.industryClasses = this.ToArray(IndustryClassEnum);
    this.createForm();
    this.isLoading$.next(false);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      industryClass: [{ value: null, disabled: false }, Validators.required]
    });
  }

  industryClassChanged($event: any) {
    this.selectedIndustryClassId = +IndustryClassEnum[$event.value];
  }

  startWizard() {
    this.isLoading$.next(true);
    const request = new StartWizardRequest();
    request.linkedItemId = this.selectedIndustryClassId;
    request.type = 'whatsapp-company-list';

    this.wizardService.startWizard(request).subscribe(result => {
      this.alertService.success('Wizard created successfully');
      this.isLoading$.next(false);
    });
  }

  edit(rolePlayer: RolePlayer) {
    const dialogRef = this.dialog.open(MemberWhatappContactDialogComponent, {
      width: '900px',
      data: { rolePlayer }
    });
  }

  delete(rolePlayer: RolePlayer) {
   const index = this.rolePlayers.findIndex(s => s === rolePlayer);
   if (index !== -1) {
    this.rolePlayers.splice(index, 1);
    }
  }

  roleplayerHasValidContacts(rolePlayerContacts: RolePlayerContact[]): boolean {
      return rolePlayerContacts.some(contact => contact.communicationType === CommunicationTypeEnum.SMS && contact.rolePlayerContactInformations.some(t => t.contactInformationType === ContactInformationTypeEnum.Declarations));
  }

  validContactToDisplay(rolePlayerContact: RolePlayerContact): boolean {
    return rolePlayerContact.rolePlayerContactInformations.some(s => s.contactInformationType === ContactInformationTypeEnum.Declarations) && rolePlayerContact.communicationType === this.SMSCommunicationType;
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }
}
