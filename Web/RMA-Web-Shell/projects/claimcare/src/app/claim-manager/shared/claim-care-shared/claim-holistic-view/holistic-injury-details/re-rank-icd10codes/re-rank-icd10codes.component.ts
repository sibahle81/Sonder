import { Component, EventEmitter, inject, Inject, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatTable } from '@angular/material/table';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BodySideAffectedTypeEnum } from 'projects/shared-models-lib/src/lib/enums/body-side-affected-type-enum';
import { InjurySeverityTypeEnum } from '../../../../enums/injury-severity-type-enum';
import { Injury } from '../../../../entities/injury';

@Component({
  templateUrl: './re-rank-icd10codes.component.html',
  styleUrls: ['./re-rank-icd10codes.component.css']
})
export class ReRankIcd10codesComponent {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  @ViewChild(MatTable) table: MatTable<any>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ReRankIcd10codesComponent>,
  ) {
    this.data.injuries.forEach(injury => {
      if (!injury.injuryRank) {
        let index = this.data.injuries.indexOf(injury);
        injury.injuryRank = index + 1;
      }
    });
  }

  save() {
    this.dialogRef.close(this.data.injuries);
  }

  moveUp(injury: Injury) {
    let index = this.data.injuries.indexOf(injury);

    if (index <= 0) {
      return; // index out of bounds or already at the top
    }

    // swap with the previous item
    [this.data.injuries[index - 1], this.data.injuries[index]] = [this.data.injuries[index], this.data.injuries[index - 1]];

    this.data.injuries[index - 1].injuryRank = index;
    this.data.injuries[index].injuryRank = index + 1;
    this.table.renderRows();
  }

  moveDown(injury: Injury) {
    let index = this.data.injuries.indexOf(injury);

    if (index < 0 || index >= this.data.injuries.length - 1) {
      return; // index out of bounds or already at the bottom
    }

    // swap with the next item
    [this.data.injuries[index + 1], this.data.injuries[index]] = [this.data.injuries[index], this.data.injuries[index + 1]];

    this.data.injuries[index + 1].injuryRank = index + 2;
    this.data.injuries[index].injuryRank = index + 1;
    this.table.renderRows();
  }

  isTopInjuryRank(injury: Injury): boolean {
    return this.data.injuries.indexOf(injury) == 0;
  }

  isBottomInjuryRank(injury: Injury): boolean {
    return this.data.injuries.indexOf(injury) == this.data.injuries.length - 1;
  }

  cancel() {
    this.dialogRef.close();
  }

  getBodySide(bodySideId: number): string {
    const statusText = BodySideAffectedTypeEnum[bodySideId];
    return statusText;
  }

  getSeverity(SeverityId: number): string {
    const statusText = InjurySeverityTypeEnum[SeverityId];
    return statusText;
  }

  getDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'icd10CodeDescription', show: true },
      { def: 'injurySeverityTypeDesc', show: true },
      { def: 'bodySideAffectedTypeDesc', show: true },
      { def: 'mmiDays', show: true },
      { def: 'injuryRank', show: true },
      { def: 'actions', show: true },
    ];

    return columnDefinitions.filter((cd) => cd.show).map((cd) => cd.def);
  }
}
