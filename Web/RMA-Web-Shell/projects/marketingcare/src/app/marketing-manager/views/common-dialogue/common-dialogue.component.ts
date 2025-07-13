import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MarketingApprovalStatusEnum } from 'projects/shared-models-lib/src/lib/enums/campaign-action.enum';
import { DataResponseEnum } from 'projects/shared-models-lib/src/lib/enums/data-response-enum';
import { MarketingAudienceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/marketing-aududience-type.enum';

interface DialogData {
  typeOfAudience: string,
  action: string,
  currentModuleId: string,
  entity: string,
  data: any
}

@Component({
  selector: 'app-common-dialogue',
  templateUrl: './common-dialogue.component.html',
  styleUrls: ['./common-dialogue.component.css']
})
export class CommonDialogueComponent implements OnInit {

  reasonText: string | undefined = null;
  isRequired: boolean = false;
  actionStatus = MarketingApprovalStatusEnum;
  isContactNumber: boolean;
  constructor(
    public dialogRef: MatDialogRef<CommonDialogueComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit(): void {
    if(this.data.typeOfAudience == (MarketingAudienceTypeEnum[MarketingAudienceTypeEnum.Contacts].toLocaleLowerCase())){
      this.isContactNumber = true;
    }else{
      this.isContactNumber = false;
    }
  }

  onConfirm() {
    this.dialogRef.close({ key: "confirm" });
  }

  onSubmitAction(): void {
    if (this.reasonText != null) {
      this.dialogRef.close({ key: "confirm", data: this.reasonText });
      this.isRequired = false;
    } else {
      this.isRequired = true;
    }
  }

  onCancel(): void {
    this.dialogRef.close({ key: 'cancel' });
  }

  onAdd(): void {
    this.dialogRef.close({ key: 'add' });
  }

  closeDialogue() {
    this.dialogRef.close();
  }

  onProceed(): void{
    this.dialogRef.close({ key: DataResponseEnum[DataResponseEnum.Success] });
  }
}
