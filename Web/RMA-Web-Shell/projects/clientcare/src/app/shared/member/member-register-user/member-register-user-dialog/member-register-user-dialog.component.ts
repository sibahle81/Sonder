import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserContact } from 'projects/clientcare/src/app/member-manager/models/user-contact';
import { UserDetails } from 'projects/clientcare/src/app/member-manager/models/user-details';
import { RoleEnum } from 'projects/shared-models-lib/src/lib/enums/role-enum';
import { MemberRegisterUserComponent } from '../member-register-user.component';

@Component({
  templateUrl: './member-register-user-dialog.component.html',
  styleUrls: ['./member-register-user-dialog.component.css']
})

export class MemberRegisterUserDialogComponent implements OnInit {

  form: FormGroup;

  roles: string[] = ['Agent', 'Member', 'Member Payroll'];

  constructor(
    public dialogRef: MatDialogRef<MemberRegisterUserComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private readonly formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      name: [{ value: null, disabled: false }, [Validators.required]],
      surname: [{ value: null, disabled: false }, [Validators.required]],
      role: [{ value: null, disabled: false }, [Validators.required]],

      cellPhoneNo: [{ value: null, disabled: false }, [Validators.required, Validators.minLength(10)]],
      telephoneNo: [{ value: null, disabled: false }, [Validators.required, Validators.minLength(10)]],
      email: [{ value: null, disabled: false }, [Validators.required]]
    });
  }

  readForm(): UserDetails {
    const userDetails = new UserDetails();

    userDetails.name = this.form.controls.name.value;
    userDetails.surname = this.form.controls.surname.value;
    userDetails.roleName = this.form.controls.role.value;

    if (!userDetails.userContact) {
      userDetails.userContact = new UserContact();
    }

    userDetails.userContact.cellPhoneNo = this.form.controls.cellPhoneNo.value;
    userDetails.userContact.telephoneNo = this.form.controls.telephoneNo.value;
    userDetails.userContact.email = this.form.controls.email.value;

    return userDetails;
  }

  save() {
    const userDetails = this.readForm();
    this.dialogRef.close(userDetails);
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
