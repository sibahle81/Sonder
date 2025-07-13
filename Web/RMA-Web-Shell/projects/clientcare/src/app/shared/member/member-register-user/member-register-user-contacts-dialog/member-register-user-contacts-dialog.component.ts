import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserContact } from 'projects/clientcare/src/app/member-manager/models/user-contact';
import { SecurityItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/security-item-type.enum';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { GeneralAuditDialogComponent } from '../../../general-audits/general-audit-dialog/general-audit-dialog.component';
import { MemberRegisterUserComponent } from '../member-register-user.component';

@Component({
  templateUrl: './member-register-user-contacts-dialog.component.html',
  styleUrls: ['./member-register-user-contacts-dialog.component.css']
})

export class MemberRegisterUserContactsDialogComponent implements OnInit {

  form: FormGroup;

  isReadOnly = true;
  userContact: UserContact;

  requiredAuditPermission = 'View Audits';
  hasAuditPermission = false;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<MemberRegisterUserComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private readonly formBuilder: FormBuilder,
  ) {
    this.userContact = data.userContact;
  }

  ngOnInit() {
    this.hasAuditPermission = userUtility.hasPermission(this.requiredAuditPermission);

    this.createForm();
    this.setForm();
  }

  toggleReadOnly() {
    this.isReadOnly = !this.isReadOnly;

    if (this.isReadOnly) {
      this.form.controls.cellPhoneNo.disable();
      this.form.controls.telephoneNo.disable();
      this.form.controls.email.disable();
    } else {
      this.form.controls.cellPhoneNo.enable();
      this.form.controls.telephoneNo.enable();
      this.form.controls.email.enable();

    }
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      cellPhoneNo: [{ value: null, disabled: this.isReadOnly }, [Validators.required, Validators.minLength(10)]],
      telephoneNo: [{ value: null, disabled: this.isReadOnly }, [Validators.required, Validators.minLength(10)]],
      email: [{ value: null, disabled: this.isReadOnly }, [Validators.required]]
    });
  }

  readForm() {
    this.userContact.userContactId = this.userContact.userContactId ? this.userContact.userContactId : 0;
    this.userContact.cellPhoneNo = this.form.controls.cellPhoneNo.value;
    this.userContact.telephoneNo = this.form.controls.telephoneNo.value;
    this.userContact.email = this.form.controls.email.value;
  }

  setForm() {
    this.form.patchValue({
      cellPhoneNo: this.userContact.cellPhoneNo,
      telephoneNo: this.userContact.telephoneNo,
      email: this.userContact.email
    });

    if (!this.userContact.userContactId || this.userContact.userContactId <= 0) {
      this.form.controls.cellPhoneNo.enable();
      this.form.controls.telephoneNo.enable();
      this.form.controls.email.enable();
    }
  }

  save() {
    this.readForm();
    this.dialogRef.close(this.userContact);
  }

  close() {
    this.dialogRef.close(null);
  }

  openAuditDialog(userContact: UserContact) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.Security,
        clientItemType: SecurityItemTypeEnum.UserContact,
        itemId: userContact.userContactId,
        heading: 'User Contact Audit',
        propertiesToDisplay: ['CellPhoneNo', 'TelephoneNo', 'Email']
      }
    });
  }
}
