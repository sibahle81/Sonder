import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RolePlayerContact } from 'projects/clientcare/src/app/member-manager/models/roleplayer-contact';
import { CommunicationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/communication-type-enum';
import { BehaviorSubject } from 'rxjs';

@Component({
  templateUrl: './communication-type-manager-dialog.component.html',
  styleUrls: ['./communication-type-manager-dialog.component.css']
})
export class CommunicationTypeManagerDialogComponent {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  emailRecipients: RolePlayerContact[] = [];
  smsRecipients: RolePlayerContact[] = [];

  constructor(
    public dialogRef: MatDialogRef<CommunicationTypeManagerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  smsSelected($event: RolePlayerContact) {
    const index = this.smsRecipients.findIndex(s => s.rolePlayerContactId === $event.rolePlayerContactId);
    if (index === -1) {
      this.smsRecipients.push($event);
    } else {
      this.smsRecipients.splice(index, 1);
    }
  }

  emailSelected($event: RolePlayerContact) {
    const index = this.emailRecipients.findIndex(s => s.rolePlayerContactId === $event.rolePlayerContactId);
    if (index === -1) {
      this.emailRecipients.push($event);
    } else {
      this.emailRecipients.splice(index, 1);
    }
  }

  save() {
    this.dialogRef.close({
      emailRecipients: this.emailRecipients,
      smsRecipients: this.smsRecipients
    });
  }

  cancel() {
    this.dialogRef.close(null);
  }

  getCommunicationType(communicationType: CommunicationTypeEnum): string {
    return communicationType ? CommunicationTypeEnum[communicationType] : 'N/A';
  }

  isEmailSelected($event: RolePlayerContact): boolean {
    return this.emailRecipients?.some(s => s.rolePlayerContactId == $event.rolePlayerContactId);
  }

  isSmsSelected($event: RolePlayerContact): boolean {
    return this.smsRecipients?.some(s => s.rolePlayerContactId == $event.rolePlayerContactId);
  }
}
