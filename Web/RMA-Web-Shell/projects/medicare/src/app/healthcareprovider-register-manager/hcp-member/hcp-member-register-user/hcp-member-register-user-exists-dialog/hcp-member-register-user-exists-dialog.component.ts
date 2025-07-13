import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserDetails } from 'projects/clientcare/src/app/member-manager/models/user-details';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { HCPMemberRegisterUserComponent } from '../hcp-member-register-user.component';

@Component({
  templateUrl: './hcp-member-register-user-exists-dialog.component.html',
  styleUrls: ['./hcp-member-register-user-exists-dialog.component.css']
})

export class HCPMemberRegisterUserExistsDialogComponent implements OnInit {

  form: FormGroup;

  roles: string[] = ['Agent', 'Member'];
  user: User;
  userDetails: UserDetails;
  alreadyRegistered = false;

  constructor(
    public dialogRef: MatDialogRef<HCPMemberRegisterUserComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private readonly formBuilder: FormBuilder,
  ) {
    this.user = data.user;
    this.userDetails = data.userDetails;
    this.alreadyRegistered = data.alreadyRegistered;
  }

  ngOnInit() {
    if (this.alreadyRegistered) { return; }
    this.createForm();
    this.setForm();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      displayName: [{ value: null, disabled: true }],
      role: [{ value: null, disabled: true }],
      email: [{ value: null, disabled: true }]
    });
  }

  readForm() {
    this.userDetails.roleName = this.form.controls.role.value;
  }

  setForm() {
    this.form.patchValue({
      displayName: this.user.displayName,
      role:  this.user.role.name,
      email: this.user.email,
    });
  }

  save() {
    this.readForm();
    this.dialogRef.close(this.userDetails);
  }

  close() {
    this.dialogRef.close(null);
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }
}
