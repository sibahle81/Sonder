import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { HCPMemberRegisterUserComponent } from '../hcp-member-register-user.component';
import { UserHealthcareproviderMap } from '../../../models/user-healthcareprovider-map';
import { UserCompanyMapStatusEnum as UserHealthCareProviderMapStatusEnum } from 'projects/shared-models-lib/src/lib/enums/user-company-map-status-enum';

@Component({
  templateUrl: './hcp-member-register-user-update-dialog.component.html',
  styleUrls: ['./hcp-member-register-user-update-dialog.component.css']
})

export class HCPMemberRegisterUserUpdateDialogComponent implements OnInit {

  form: FormGroup;

  userHealthcareproviderMap: UserHealthcareproviderMap;
  currentUser: User;

  userHealthCareProviderMapStatusEnum: UserHealthCareProviderMapStatusEnum[];

  constructor(
    public dialogRef: MatDialogRef<HCPMemberRegisterUserComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService
  ) {
    this.userHealthcareproviderMap = data.userCompanyMap;
  }

  ngOnInit() {
    this.getLookups();

  }

  getLookups() {
    this.userHealthCareProviderMapStatusEnum = this.ToArray(UserHealthCareProviderMapStatusEnum);
    this.filterUserCompanyMapStatuses();

    this.currentUser = this.authService.getCurrentUser();

    this.createForm();
    this.setForm();
  }

  filterUserCompanyMapStatuses() {
    const index = this.userHealthCareProviderMapStatusEnum.findIndex(s => s.toString() === UserHealthCareProviderMapStatusEnum[UserHealthCareProviderMapStatusEnum.Pending]);
    if (index > -1) {
      this.userHealthCareProviderMapStatusEnum.splice(index, 1);
    }
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      status: [{ value: null, disabled: this.currentUser.email === this.userHealthcareproviderMap.userName }, [Validators.required]]
    });
  }

  readForm() {
    this.userHealthcareproviderMap.userHealthcareproviderMapStatus = +UserHealthCareProviderMapStatusEnum[this.form.controls.status.value];
  }

  setForm() {
    this.form.patchValue({
      status: UserHealthCareProviderMapStatusEnum[this.userHealthcareproviderMap.userHealthcareproviderMapStatus]
    });
  }

  save() {
    this.readForm();
    this.dialogRef.close(this.userHealthcareproviderMap);
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
