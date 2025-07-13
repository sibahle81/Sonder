import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { ContactDesignationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/contact-designation-type-enum';
import { ContactInformationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/contact-information-type-enum';
import { ModeEnum } from 'projects/shared-models-lib/src/lib/enums/mode-enum';
import { PersonEventModel } from '../../../../entities/personEvent/personEvent.model';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'holistic-beneficiary-container',
  templateUrl: './holistic-beneficiary-container.component.html',
  styleUrls: ['./holistic-beneficiary-container.component.css']
})
export class HolisticBeneficiaryContainerComponent {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  beneficiary: RolePlayer;
  personEvent: PersonEventModel;
  selectedPersonEvent = new PersonEventModel();
  toRolePlayerId: number;
  isReadOnly = false;
  isWizard = false;
  mode = ModeEnum.Default;

  showRelation = false;
  showBankingDetails = false;
  personEventRolePlayerId: number;
  isBeneficiaryNotCaptured = true;

  selectedTabIndex = 0;

  filterContactInformationDropdown = [ContactInformationTypeEnum.Claims];
  filterContactsOnDesignationTypeDropdown = [ContactDesignationTypeEnum.PrimaryContact];

  constructor(
    public dialogRef: MatDialogRef<HolisticBeneficiaryContainerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private readonly confirmService: ConfirmationDialogsService,
    private readonly rolePlayerService: RolePlayerService
  ) {
    this.beneficiary = this.data.beneficiary;
    this.personEvent = this.data.personEvent;
    this.isWizard = this.data.isWizard;
    this.mode = this.data.mode;
    this.isReadOnly = this.data.isReadOnly;
    this.toRolePlayerId = this.data.personEvent?.insuredLifeId ? this.data.personEvent?.insuredLifeId : 0;
    this.setRolePlayer()
  }

  ngOnInit() {
    this.isBeneficiaryNotCaptured = this.beneficiary.rolePlayerId ? false : true;
  }

  setRolePlayer() {
    this.selectedPersonEvent.rolePlayer = this.beneficiary;
    this.showRelation = this.personEvent?.beneficiaries?.length > 0 || this.personEvent.rolePlayer.rolePlayerId > 0;
  }

  view() {
    if (!this.isReadOnly && (this.beneficiary.rolePlayerBankingDetails?.length < 1 || !this.beneficiary.fromRolePlayers[0]?.rolePlayerTypeId || this.selectedPersonEvent.rolePlayer.rolePlayerContacts?.length < 1)) {
      let message = 'Beneficiary details are incomplete. ';
      let required = '';
      if(!this.beneficiary.fromRolePlayers[0]?.rolePlayerTypeId) {
        required += 'Relation, ';
      }

      if(this.beneficiary.rolePlayerBankingDetails?.length < 1) {
        required += 'Banking, ';
      }

      if(this.selectedPersonEvent.rolePlayer.rolePlayerContacts?.length < 1) {
        required += 'Contact, ';
      }

      const index = required.lastIndexOf(',');
      message += `${required.substring(0, index)} details are required. Do you want to proceed?`;

      this.confirmService.confirmWithoutContainer('Incomplete Beneficiary Details',
        message, 'Center', 'Center', 'Yes', 'No').subscribe(
          result => {
            if (result) {
              this.dialogRef.close();
            }
          });
    }
    else {
      this.dialogRef.close();
    }
  }

  setBeneficiary($event: RolePlayer, bypassReset = false) {
    if (!this.isWizard) {
      this.beneficiary = $event;
      this.beneficiary.rolePlayerId = $event.rolePlayerId;
      this.selectedPersonEvent.rolePlayer = this.beneficiary;
      this.isBeneficiaryNotCaptured = false;
      if (this.beneficiary.fromRolePlayers?.length > 0 && this.data.mode === ModeEnum.NewBeneficiary) {
        this.dialogRef.close(this.beneficiary);
      }
    } else {
      this.selectedPersonEvent.rolePlayer = $event;
    }

    this.showRelation = $event.rolePlayerId > 0 ? true : false;

    if (!bypassReset) {
      this.selectedTabIndex = 1;
    }
  }

  isRelationship($event: RolePlayer) {
    this.getRolePlayer($event.rolePlayerId);
  }

  getRolePlayer(rolePlayerId: number) {
    this.isLoading$.next(true);
    this.rolePlayerService.getRolePlayer(rolePlayerId).subscribe(result => {
      this.beneficiary = result;
      this.selectedPersonEvent.rolePlayer = result;
      this.isLoading$.next(false);
      this.showBankingDetails = true;
      this.selectedTabIndex = 2;
    });
  }
}
