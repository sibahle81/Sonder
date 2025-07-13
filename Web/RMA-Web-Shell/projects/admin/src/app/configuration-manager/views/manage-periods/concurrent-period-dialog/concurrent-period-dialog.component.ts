import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ManagePeriodsComponent } from '../manage-periods/manage-periods.component';

@Component({
  selector: 'concurrent-period-dialog',
  templateUrl: './concurrent-period-dialog.component.html'
})
export class ConcurrentPeriodDialogComponent {

  runPeriodConcurrently: boolean;

  constructor(
    public dialogRef: MatDialogRef<ManagePeriodsComponent>
  ) { }

  toggle(event$: string) {
    this.runPeriodConcurrently = event$ === 'concurrent' ? true : false;
  }

  submit() {
    const data = {
      runPeriodConcurrently: this.runPeriodConcurrently,
    };

    this.dialogRef.close(data);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
