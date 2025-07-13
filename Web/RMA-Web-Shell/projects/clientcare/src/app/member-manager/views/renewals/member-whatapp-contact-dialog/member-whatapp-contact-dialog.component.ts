import { Component, Inject } from '@angular/core';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MemberWhatsappListComponent } from '../member-whatsapp-list/member-whatsapp-list.component';
import { UntypedFormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-member-whatapp-contact-dialog',
  templateUrl: './member-whatapp-contact-dialog.component.html',
  styleUrls: ['./member-whatapp-contact-dialog.component.css']
})
export class MemberWhatappContactDialogComponent {

  member: RolePlayer;

  constructor(
    public dialogRef: MatDialogRef<MemberWhatsappListComponent>,
    private readonly formBuilder: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data.rolePlayer) {
      this.member = data.rolePlayer;
    }
  }

  cancel() {
    this.dialogRef.close(this.member);
  }
}
