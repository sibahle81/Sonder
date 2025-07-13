import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-dialog',
  templateUrl: './dialog.component.html'
})

export class NoteDialogComponent {

  note: string;

  constructor(
    public dialogRef: MatDialogRef<NoteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.note = data.noteText as string;

  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }
}
