import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PensionLedgerStatusNotification } from 'projects/penscare/src/app/shared-penscare/models/pension-ledger-status-notification.model';
import { PensionLedgerStatusEnum } from 'projects/shared-models-lib/src/lib/enums/pension-ledger-status.enum';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import 'src/app/shared/extensions/string.extensions';

@Component({
  selector: 'app-status-change-reason-dialog',
  templateUrl: './status-change-reason-dialog.component.html',
  styleUrls: ['./status-change-reason-dialog.component.css']
})
export class StatusChangeReasonDialogComponent implements OnInit {
  form: UntypedFormGroup;
  inputData: {
    action: string,
    status: PensionLedgerStatusEnum,
    pensionLedgerId: number
    beneficiarySurname: string,
    pensionCaseNumber: string,
  };
  id: number;
  action = '';

  ledgerStatusChangeReasons: Lookup[] = []


  constructor (
    public dialogRef: MatDialogRef<StatusChangeReasonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private lookupService : LookupService,
    private formBuilder: UntypedFormBuilder
  ) {
    this.inputData = data;
    this.action = String.capitalizeFirstLetter(this.inputData.action);
  }

  ngOnInit() {
    this.lookupService.getLedgerStatusChangeReasons().subscribe(response => {
      this.ledgerStatusChangeReasons = response;
    })
    this.createForm()
  }

  changeStatus() {
    this.dialogRef.close({
        status: this.inputData.status,
        reason: this.form.controls['changeReason'].value,
        pensionLedgerId: this.inputData.pensionLedgerId,
        pensionCaseNumber: this.inputData.pensionCaseNumber,
        beneficiarySurname: this.inputData.beneficiarySurname
      } as unknown as PensionLedgerStatusNotification);
  }

  createForm() {
    this.form = this.formBuilder.group({
      changeReason: new UntypedFormControl('')
    })
  };

  cancel() {
    this.dialogRef.close({
      delete: false
    });
  }
}
