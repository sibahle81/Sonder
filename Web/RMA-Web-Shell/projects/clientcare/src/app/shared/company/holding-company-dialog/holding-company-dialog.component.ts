import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { CompanyLevelEnum } from 'projects/shared-models-lib/src/lib/enums/company-level-enum';
import { Company } from '../../../policy-manager/shared/entities/company';
import { ClientTypeEnum } from '../../../policy-manager/shared/enums/client-type-enum';
import { MemberStatusEnum } from 'projects/shared-models-lib/src/lib/enums/member-status-enum';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';
import { RequiredDocumentService } from 'projects/admin/src/app/configuration-manager/shared/required-document.service';
import { CompanyIdTypeEnum } from 'projects/shared-models-lib/src/lib/enums/company-id-type-enum';
import { RolePlayerService } from '../../../policy-manager/shared/Services/roleplayer.service';

@Component({
  templateUrl: './holding-company-dialog.component.html',
  styleUrls: ['./holding-company-dialog.component.css']
})
export class HoldingCompanyDialogComponent {

  form: UntypedFormGroup;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  rolePlayer: RolePlayer;

  registrationTypes: CompanyIdTypeEnum[];

  _new = MemberStatusEnum.New;
  isEdit: boolean;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly requiredDocumentService: RequiredDocumentService,
    private readonly rolePlayerService: RolePlayerService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<HoldingCompanyDialogComponent>
  ) {
    this.rolePlayer = this.data.rolePlayer;
    this.setRolePlayer();
  }

  setRolePlayer() {
    if (this.rolePlayer) {
      if (!this.rolePlayer.rolePlayerId || this.rolePlayer.rolePlayerId <= 0) {
        this.rolePlayer.company = new Company();
        this.rolePlayer.company.companyLevel = CompanyLevelEnum.HoldingCompany;
        this.rolePlayer.rolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Company;
        this.rolePlayer.clientType = ClientTypeEnum.Company;
        this.rolePlayer.memberStatus = MemberStatusEnum.New;
        this.generateRolePlayerId();
      }
    }
  }

  generateRolePlayerId() {
    this.requiredDocumentService.generateDocumentNumber('RolePlayerId').subscribe(result => {
      this.rolePlayer.rolePlayerId = +result;
      this.getLookups();
    });
  }

  getLookups() {
    this.registrationTypes = this.ToArray(CompanyIdTypeEnum);
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      name: [{ value: null, disabled: false }, Validators.required],
      registrationType: [{ value: null, disabled: false }, Validators.required],
      registrationNumber: [{ value: null, disabled: false }, Validators.required],
      companyLevel: [{ value: this.getCompanyLevel(this.rolePlayer.company.companyLevel), disabled: true }]
    });

    this.isLoading$.next(false);
  }

  readForm() {
    this.rolePlayer.displayName = this.form.controls.name.value;
    this.rolePlayer.company.name = this.rolePlayer.displayName;

    this.rolePlayer.company.companyIdType = +CompanyIdTypeEnum[this.form.controls.registrationType.value];

    this.rolePlayer.company.idNumber = this.form.controls.registrationNumber.value;
    this.rolePlayer.company.referenceNumber = this.rolePlayer.company.idNumber;

    this.rolePlayer.memberStatus = MemberStatusEnum.ActiveWithoutPolicies;
  }

  save() {
    this.isLoading$.next(true);
    this.readForm();

    if (!this.isEdit) {
      this.create();
    } else {
      this.update();
    }
  }

  create() {
    this.rolePlayerService.addRolePlayer(this.rolePlayer).subscribe(result => {
      this.rolePlayer.company.rolePlayerId = result;
      this.disableForm();
      this.isLoading$.next(false);
    });
  }

  update() {
    this.rolePlayerService.updateRolePlayer(this.rolePlayer).subscribe(result => {
      this.disableForm();
      this.isEdit= false;
      this.isLoading$.next(false);
    });
  }

  edit() {
    this.isEdit = true;
    this.enableForm();
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  getCompanyLevel(companyLevel: CompanyLevelEnum): string {
    return this.formatLookup(CompanyLevelEnum[companyLevel]);
  }

  formatLookup(text: string): string {
    if (!text) { return ''; }
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  disableForm() {
    if (this.rolePlayer && this.rolePlayer.rolePlayerId > 0) {
      this.form.controls.name.disable();
      this.form.controls.registrationType.disable();
      this.form.controls.registrationNumber.disable();
      this.form.markAsPristine();
    }
  }

  enableForm() {
    this.form.controls.name.enable();
    this.form.controls.registrationType.enable();
    this.form.controls.registrationNumber.enable();
  }

  close() {
    if (this.rolePlayer.company.rolePlayerId > 0) {
      this.dialogRef.close(this.rolePlayer);
    } else {
      this.dialogRef.close(null);
    }
  }
}
