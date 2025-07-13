import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { NoteItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-item-type-enum';

@Component({
  templateUrl: './not-repuadiate-claim-pop-up-note.component.html',
  styleUrls: ['./not-repuadiate-claim-pop-up-note.component.css']
})
export class NotRepuadiateClaimPopUpNoteComponent implements OnInit {

  moduleType = [ModuleTypeEnum.ClaimCare];
  noteItemType = NoteItemTypeEnum.PersonEvent;

  constructor(
    public dialogRef: MatDialogRef<NotRepuadiateClaimPopUpNoteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }


  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close(false);
  }

  cancel(isCancel: boolean) {
    if(isCancel){
      this.dialogRef.close(null);
    }
    else{
      this.dialogRef.close(this.data);
    }
  }
}
