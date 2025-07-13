import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';

@Component({
  templateUrl: './healthcare-provider-search-dialog.component.html'
})
export class HealthcareProviderSearchDialogComponent {

  healthCareProvider: HealthCareProvider;

  constructor(
    public dialogRef: MatDialogRef<HealthcareProviderSearchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  healthCareProviderSelected($event: HealthCareProvider) {
    this.healthCareProvider = $event;
    this.confirm();
  }

  confirm() {
    this.dialogRef.close(this.healthCareProvider);
  }

}