import { LeadContact } from './../../../../lead-manager/models/lead-contact';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CommunicationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/communication-type-enum';
import { RolePlayerContact } from '../../../models/roleplayer-contact';
import { MemberRenewalLetterAuditComponent } from '../member-renewal-letter-audit/member-renewal-letter-audit.component';
import { ContactDesignationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/contact-designation-type-enum';
import { TitleEnum } from 'projects/shared-models-lib/src/lib/enums/title-enum';

@Component({
  selector: 'app-resend-member-renewal-letter',
  templateUrl: './resend-member-renewal-letter.component.html',
  styleUrls: ['./resend-member-renewal-letter.component.css']
})
export class ResendMemberRenewalLetterComponent {

  form: UntypedFormGroup;
  rolePlayerContacts: RolePlayerContact[] = [];
  selectedRolePlayerContacts: RolePlayerContact[] = [];
  rolePlayerId: number;
  hideForm = true;

  constructor(
    public dialogRef: MatDialogRef<MemberRenewalLetterAuditComponent>,
    private readonly formBuilder: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    if (data) {
      data.contacts.forEach(contact => {
        this.rolePlayerContacts.push(contact);
        this.rolePlayerId = contact.rolePlayerId;
      });
    }
    this.createForm();
  }

  readForm(): RolePlayerContact {
    const rolePlayerContact = new RolePlayerContact();
    rolePlayerContact.rolePlayerContactId = 0;
    rolePlayerContact.firstname = this.form.controls.name.value;
    rolePlayerContact.communicationType = CommunicationTypeEnum.Email;
    rolePlayerContact.emailAddress = this.form.controls.communicationTypeValue.value;
    rolePlayerContact.rolePlayerId = this.rolePlayerId;
    rolePlayerContact.contactDesignationType = ContactDesignationTypeEnum.PrimaryContact;
    rolePlayerContact.title = TitleEnum.Mr;
    return rolePlayerContact;
  }

  add() {
    const rolePlayerContact = this.readForm();
    this.rolePlayerContacts.push(rolePlayerContact);
    this.reset();
    this.toggleForm();
  }

  submit() {
    this.readForm();
    const data = {
      rolePlayerContacts: this.selectedRolePlayerContacts
    };

    this.dialogRef.close(data);
  }

  createForm() {
    this.form = this.formBuilder.group({
      name: [{ value: null, disabled: false }, Validators.required],
      communicationTypeValue: [{ value: null, disabled: false }, [Validators.required, Validators.email]],
    });
  }

  reset() {
    this.form.controls.name.reset();
    this.form.controls.communicationTypeValue.reset();
  }

  cancel() {
    this.dialogRef.close(null);
  }

  delete(contact: RolePlayerContact) {
    const index = this.rolePlayerContacts.findIndex(s => s === contact);
    this.rolePlayerContacts.splice(index, 1);
  }

  toggleForm() {
    this.hideForm = !this.hideForm;
  }

  selected(contact: RolePlayerContact) {
    const index = this.selectedRolePlayerContacts.findIndex(s => s === contact);
    if (index >= 0) {
      this.selectedRolePlayerContacts.splice(index, 1);
    } else {
      this.selectedRolePlayerContacts.push(contact);
    }
  }

}
