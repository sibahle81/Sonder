import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LinkedUserMember } from 'projects/clientcare/src/app/policy-manager/shared/entities/linked-user-member';
import { UserContextViewComponent } from '../user-context-view/user-context-view.component';

@Component({
  templateUrl: './user-context-dialog.component.html',
  styleUrls: ['./user-context-dialog.component.css']
})

export class UserContextDialogComponent implements OnInit {

  userId: number;
  selectedMemberContext: LinkedUserMember;

  constructor(
    public dialogRef: MatDialogRef<UserContextViewComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.userId = +data.userId;
  }

  ngOnInit() {
  }

  setSelectedMember($event: LinkedUserMember) {
    this.selectedMemberContext = $event;
    this.dialogRef.close(this.selectedMemberContext);
  }

  close() {
    this.dialogRef.close(null);
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }
}
