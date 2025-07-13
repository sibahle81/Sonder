import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { CommunicationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/communication-type-enum';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerContact } from 'projects/clientcare/src/app/member-manager/models/roleplayer-contact';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';
import { ContactInformationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/contact-information-type-enum';

@Component({
  templateUrl: './member-contact-dialog.component.html',
  styleUrls: ['./member-contact-dialog.component.css']
})

export class MemberContactDialogComponent {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  rolePlayerId: number;
  rolePlayer: RolePlayer;

  filteredInformationTypes = [ContactInformationTypeEnum.Claims, ContactInformationTypeEnum.Declarations, ContactInformationTypeEnum.Invoices, ContactInformationTypeEnum.PolicyInformation];;
  supportedPreferredCommunicationTypes = [CommunicationTypeEnum.Email];
  selectedContacts: RolePlayerContact[];

  constructor(
    public dialogRef: MatDialogRef<MemberContactDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly memberService: MemberService
  ) {
    if (data.rolePlayerId) {
      this.rolePlayerId = data.rolePlayerId;
      this.filteredInformationTypes = data.filteredInformationTypes ? data.filteredInformationTypes : this.filteredInformationTypes;
      this.getRolePlayer();
    }
  }

  getRolePlayer() {
    this.memberService.getMember(this.rolePlayerId).subscribe(result => {
      this.rolePlayer = result;
      this.isLoading$.next(false);
    });
  }

  contactSelected($event: RolePlayerContact[]) {
    this.selectedContacts = $event;
  }

  save() {
    this.dialogRef.close(this.selectedContacts);
  }

  cancel() {
    this.selectedContacts = null;
    this.dialogRef.close(null);
  }
}
