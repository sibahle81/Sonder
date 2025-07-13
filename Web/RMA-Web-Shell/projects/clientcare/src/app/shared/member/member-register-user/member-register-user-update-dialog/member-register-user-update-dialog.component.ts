import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserCompanyMap } from 'projects/clientcare/src/app/member-manager/models/user-company-map';
import { UserCompanyMapStatusEnum } from 'projects/shared-models-lib/src/lib/enums/user-company-map-status-enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { MemberRegisterUserComponent } from '../member-register-user.component';

@Component({
  templateUrl: './member-register-user-update-dialog.component.html',
  styleUrls: ['./member-register-user-update-dialog.component.css']
})

export class MemberRegisterUserUpdateDialogComponent implements OnInit {

  form: FormGroup;

  userCompanyMap: UserCompanyMap;
  currentUser: User;

  userCompanyMapStatuses: UserCompanyMapStatusEnum[];

  constructor(
    public dialogRef: MatDialogRef<MemberRegisterUserComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService
  ) {
    this.userCompanyMap = data.userCompanyMap;
  }

  ngOnInit() {
    this.getLookups();

  }

  getLookups() {
    this.userCompanyMapStatuses = this.ToArray(UserCompanyMapStatusEnum);
    this.filterUserCompanyMapStatuses();

    this.currentUser = this.authService.getCurrentUser();

    this.createForm();
    this.setForm();
  }

  filterUserCompanyMapStatuses() {
    const index = this.userCompanyMapStatuses.findIndex(s => s.toString() === UserCompanyMapStatusEnum[UserCompanyMapStatusEnum.Pending]);
    if (index > -1) {
      this.userCompanyMapStatuses.splice(index, 1);
    }
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      status: [{ value: null, disabled: this.currentUser.email === this.userCompanyMap.userName }, [Validators.required]]
    });
  }

  readForm() {
    this.userCompanyMap.userCompanyMapStatus = +UserCompanyMapStatusEnum[this.form.controls.status.value];
  }

  setForm() {
    this.form.patchValue({
      status: UserCompanyMapStatusEnum[this.userCompanyMap.userCompanyMapStatus]
    });
  }

  save() {
    this.readForm();
    this.dialogRef.close(this.userCompanyMap);
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
