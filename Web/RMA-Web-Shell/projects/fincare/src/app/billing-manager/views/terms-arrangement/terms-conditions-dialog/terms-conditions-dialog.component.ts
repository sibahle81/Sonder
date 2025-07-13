import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-terms-conditions-dialog',
  templateUrl: './terms-conditions-dialog.component.html',
  styleUrls: ['./terms-conditions-dialog.component.css']
})
export class TermsConditionsDialogComponent   {

  parametersAudit: any;
  reportTitle = 'Memo Of Agreement';
  reportServerAudit: string;
  reportUrlAudit = 'RMA.Reports.FinCare/RMATermsMOAWizardReport';
  showParametersAudit = 'false';
  languageAudit = 'en-us';
  widthAudit = 100;
  heightAudit = 100;
  toolbarAudit = 'true';
  showReport = true;
  formatAudit = 'PDF';

  constructor(public dialogRef: MatDialogRef<TermsConditionsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.reportServerAudit = data.ssrsBaseUrl;
    this.parametersAudit = { wizardId: data.wizardId };
  }

  close(): void {
    this.dialogRef.close(true);
  }

}
