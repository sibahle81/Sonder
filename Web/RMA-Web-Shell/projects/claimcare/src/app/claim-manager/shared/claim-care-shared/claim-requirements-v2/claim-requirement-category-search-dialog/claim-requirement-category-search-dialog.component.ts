import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClaimRequirementCategory } from '../../../entities/claim-requirement-category';

@Component({
  templateUrl: './claim-requirement-category-search-dialog.component.html',
  styleUrls: ['./claim-requirement-category-search-dialog.component.css']
})
export class ClaimRequirementCategorySearchDialogComponent {

  selectedClaimRequirementCategories: ClaimRequirementCategory[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ClaimRequirementCategorySearchDialogComponent>
  ) { }

  setSelectedClaimRequirementCategories($event: ClaimRequirementCategory[]) {
    this.selectedClaimRequirementCategories = $event;
  }

  save() {
    this.dialogRef.close(this.selectedClaimRequirementCategories);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
