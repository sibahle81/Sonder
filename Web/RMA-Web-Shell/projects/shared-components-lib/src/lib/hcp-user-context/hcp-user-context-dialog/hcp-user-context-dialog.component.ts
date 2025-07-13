import { Component, Inject, OnInit } from '@angular/core';
import { UserHealthCareProvider } from 'projects/shared-models-lib/src/lib/security/user-healthcare-provider-model';
import { HcpUserContextViewComponent } from '../hcp-user-context-view/hcp-user-context-view.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LinkedUserMember } from 'projects/clientcare/src/app/policy-manager/shared/entities/linked-user-member';

@Component({
  selector: 'hcp-user-context-dialog',
  templateUrl: './hcp-user-context-dialog.component.html',
  styleUrls: ['./hcp-user-context-dialog.component.css']
})
export class HcpUserContextDialogComponent implements OnInit {

  userId: number;
  selectedHCPContext: UserHealthCareProvider;

  constructor(
    public dialogRef: MatDialogRef<HcpUserContextViewComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) 
  {
    this.userId = +data.userId;
  }

  ngOnInit() {
  }

  setSelectedHCP($event: UserHealthCareProvider) {
    this.selectedHCPContext = $event;
    this.dialogRef.close(this.selectedHCPContext);
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
