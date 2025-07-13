import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { BehaviorSubject } from 'rxjs';
import { RolePlayerService } from '../../../policy-manager/shared/Services/roleplayer.service';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

@Component({
  selector: 'app-vopd-manual-override-dialog',
  templateUrl: './vopd-manual-override-dialog.component.html',
  styleUrls: ['./vopd-manual-override-dialog.component.css']
})
export class VopdManualOverrideDialogComponent implements OnInit {
  isSubmitting$ = new BehaviorSubject(false);
  idNumber: string;
  memberName: string;
  surname: string;
  form: UntypedFormGroup;
  showSubmit = false;
  isAliveOptionSelected = false;
  isAlive: boolean;
  vopdManualVerificationDocSet = DocumentSetEnum.VopdManualVerification;
  documentSystemName = DocumentSystemNameEnum.MemberManager;
  canEditVopd = false;
  allRequiredDocumentsUploaded = false;
  maxDate: Date;
  dateOfDeath: Date;
  noEditPermission: false;
  fileIdentifier: string;
  constructor(public dialogRef: MatDialogRef<VopdManualOverrideDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly formBuilder: UntypedFormBuilder, private readonly rolePlayerService: RolePlayerService, private alertService: AlertService,
  ) {
    this.idNumber = data.idNumber;
    this.memberName = data.memberName;
    this.surname = data.surname;
    this.canEditVopd = data.canEditVopd
    this.isAlive = data.isAlive;
    this.dateOfDeath = data.dateOfDeath;
    this.noEditPermission = data.noEditPermission;
    this.fileIdentifier = data.fileIdentifier;
  }
  ngOnInit(): void {
    this.createForm();
  }

  createForm(): void {
    this.maxDate = new Date();
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      deceasedStatus: [null, Validators.required],
      memberName: [null, Validators.required],
      idNumber: [null, Validators.required],
      dateOfDeath: [],
    });
    this.form.get('memberName').setValue(this.memberName);
    this.form.get('idNumber').setValue(this.idNumber);

    if (this.dateOfDeath) {
      this.form.get('dateOfDeath').setValue(this.dateOfDeath );
    }
    if (!this.canEditVopd) {
      if (this.isAlive !== null) {
        this.form.get('deceasedStatus').setValue(this.isAlive);
        this.isAliveOptionSelected = true;
      }
      this.disableFormControl('memberName');
      this.disableFormControl('idNumber');
      this.disableFormControl('dateOfDeath');
      this.disableFormControl('deceasedStatus');
    }
    else {
      if (this.isAlive !== null) {
        this.form.get('deceasedStatus').setValue(this.isAlive);
        this.isAliveOptionSelected = true;
      }
      this.disableFormControl('memberName');
      this.disableFormControl('idNumber');
    }
  }

  canShowSubmit() {
    if (this.isAliveOptionSelected && this.allRequiredDocumentsUploaded) {
      this.showSubmit = true;
    } else {
      this.showSubmit = false;
    }
  }

  submit() {
    this.isSubmitting$.next(true);
    const idNumber = this.form.get('idNumber').value;;
    const firstname = this.form.get('memberName').value;
    const surname = '';
    let dateOfDeath = null;
    let deceasedStatus: string;
    if (this.isAlive) {
      deceasedStatus = 'ALIVE';
    }
    else {
      deceasedStatus = 'DECEASED';
    }

    if (this.form.get('dateOfDeath').value) {
      dateOfDeath = this.form.get('dateOfDeath').value;
    }
    const vopdDatetime = new Date();
    this.rolePlayerService.overrideRolePlayerVopd(dateOfDeath, idNumber, firstname, surname, deceasedStatus, vopdDatetime, this.fileIdentifier).subscribe(
      response => {
        if (response) {
          this.isSubmitting$.next(false);
          this.dialogRef.close(response);
        }
        else
        {
          this.isSubmitting$.next(false);
          this.alertService.error('Cannot override Vopd multiple times.');
        }
      }
      , error => {
        this.isSubmitting$.next(false);
      }
    );
  }

  close() {
    this.dialogRef.close(false);
  }

  onDeceasedStatusSelected(value: boolean) {
    this.isAliveOptionSelected = true
    this.isAlive = value;
    this.canShowSubmit();
  }

  isRequiredDocumentsUploaded(isUploaded: boolean) {
    this.allRequiredDocumentsUploaded = isUploaded;
    this.canShowSubmit();
  }


  disableFormControl(controlName: string) {
    if (this.form.controls[controlName]) {
      this.form.get(controlName).disable();
    } else {
      this.form.get(controlName).disable();
    }
  }

  enableFormControl(controlName: string) {
    if (this.form.controls[controlName]) {
      this.form.get(controlName).enable();
    } else {
      this.form.get(controlName).enable();
    }
  }
}