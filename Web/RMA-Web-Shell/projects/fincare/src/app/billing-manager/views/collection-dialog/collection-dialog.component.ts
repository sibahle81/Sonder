import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Collection } from '../../models/collection';

@Component({
  selector: 'app-collection-dialog',
  templateUrl: './collection-dialog.component.html'
})
export class CollectionDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<CollectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Collection) {}

  onNoClick(): void {
    this.dialogRef.close(null);
  }
}
