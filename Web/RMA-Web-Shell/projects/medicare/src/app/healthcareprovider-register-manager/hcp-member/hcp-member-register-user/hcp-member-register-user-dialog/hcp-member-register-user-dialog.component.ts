import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserContact } from 'projects/clientcare/src/app/member-manager/models/user-contact';
import { UserDetails } from 'projects/clientcare/src/app/member-manager/models/user-details';
import { RoleEnum } from 'projects/shared-models-lib/src/lib/enums/role-enum';
import { HCPMemberRegisterUserComponent } from '../hcp-member-register-user.component';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { PortalTypeEnum } from 'projects/shared-models-lib/src/lib/enums/portal-type-enum';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { AuthenticationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/authentication-type-enum';
import { UserReminderItemTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-item-type-enum';
import { UserReminderTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-type-enum';

@Component({
  templateUrl: './hcp-member-register-user-dialog.component.html',
  styleUrls: ['./hcp-member-register-user-dialog.component.css']
})

export class HCPMemberRegisterUserDialogComponent implements OnInit {

  form: FormGroup;

  roles: string[] = ['Agent', 'Member'];

  constructor(
    public dialogRef: MatDialogRef<HCPMemberRegisterUserComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private readonly formBuilder: FormBuilder,
    private readonly userService: UserService,
    private readonly privateAlertService: AlertService
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

  readForm(): User {
    const userDetails = new User();

    userDetails.name = this.form.controls.name.value + ' '  + this.form.controls.surname.value;
    userDetails.roleName = this.form.controls.role.value;
    userDetails.telNo = this.form.controls.cellPhoneNo.value;
    userDetails.email = this.form.controls.email.value;
    userDetails.displayName = this.form.controls.name.value + ' '  + this.form.controls.surname.value;
    userDetails.isInternalUser = false;
    userDetails.authenticationType = AuthenticationTypeEnum.FormsAuthentication;
    userDetails.portalType = PortalTypeEnum.HCP;
    
    return userDetails;
  }

  save() {
    const userDetails = this.readForm();
    this.dialogRef.close(userDetails);
    this.userService.addUser(userDetails).subscribe(() => this.done(userDetails.displayName));
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

  done(name: string = null): void {
    this.privateAlertService.success(`'${name == null ? this.form.value.name : name}' was saved successfully`,
      `User saved`,
      true);
  }

}
