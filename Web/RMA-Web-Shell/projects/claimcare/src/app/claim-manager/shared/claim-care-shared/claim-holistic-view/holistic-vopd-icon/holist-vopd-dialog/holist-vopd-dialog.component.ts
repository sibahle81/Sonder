import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ClientVopdResponse } from 'projects/clientcare/src/app/policy-manager/shared/entities/vopd-response';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { BehaviorSubject } from 'rxjs';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { VopdStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/vopd-status.enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { MemberVopdStatus } from 'projects/clientcare/src/app/policy-manager/shared/entities/member-vopd-status';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Guid } from 'guid-typescript';
import { VopdManualOverrideDialogComponent } from 'projects/clientcare/src/app/shared/vopd/vopd-manual-override-dialog/vopd-manual-override-dialog.component';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { NotesService } from 'projects/shared-components-lib/src/lib/notes/notes.service';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  selector: 'holist-vopd-dialog',
  templateUrl: './holist-vopd-dialog.component.html',
  styleUrls: ['./holist-vopd-dialog.component.css']
})
export class HolistVopdDialogComponent extends UnSubscribe implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  vopdStatus = '';
  deadAlive = '';
  reason = '';
  surnameMatch = '';
  user: User;
  rolePlayer: RolePlayer;
  clientVopdResponse: ClientVopdResponse;
  clientVopdResponses: ClientVopdResponse[] = [];
  vopdProcessed = +VopdStatusEnum.Processed;
  manualVerification = +VopdStatusEnum.ManualVerification;
  memberVopdStatus: MemberVopdStatus;
  hasEditVopdPermission = false;
  isProcessed = false;
  isCancel = false;
  personEventId: number;
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public rolePlayerService: RolePlayerService,
    private readonly alertService: AlertService,
    public dialogRef: MatDialogRef<HolistVopdDialogComponent>,
    private readonly noteService: NotesService,
    private authService: AuthService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.rolePlayer = this.data.rolePlayer;
    this.personEventId = this.data.personEventId;
    this.checkVopdStatus(this.rolePlayer);
    this.hasEditVopdPermission = userUtility.hasPermission('Override Verification Of Personal Details');
  }

  checkVopdStatus(rolePlayer: RolePlayer) {
    this.rolePlayerService.getVOPDResponseResultByRoleplayerId(rolePlayer.person.rolePlayerId).subscribe(results => {
      if (results) {
        this.clientVopdResponses.push(results);
        this.vopdStatus = VopdStatusEnum[results.vopdStatus];
        if (results.vopdStatus === VopdStatusEnum.Processed || results.vopdStatus === VopdStatusEnum.ManualVerification && results.deceasedStatus) {
          this.isProcessed = true;
          this.deadAlive = results.deceasedStatus.length > 0 ? results.deceasedStatus.charAt(0).toUpperCase() + results.deceasedStatus.substr(1).toLowerCase() : '';
          this.reason = results.reason;
          if (results.identity) {
            this.surnameMatch = 'Yes';
          } else {
            this.surnameMatch = 'No';
          }
        }
        if (results.vopdStatus === VopdStatusEnum.Processed || results.vopdStatus === VopdStatusEnum.ManualVerification) {
          rolePlayer.person.isVopdVerified = true;
        }
        this.isLoading$.next(false);
      } else { this.isLoading$.next(false); }
    });
  }

  getVOPDStatus(id: number) {
    if (id > 0) {
      return this.formatText(VopdStatusEnum[id]);
    }
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  close() {
    this.isCancel = true;
    this.dialogRef.close(false);
  }

  reCheckVopdStatus() {
    this.checkVopdStatus(this.rolePlayer);
  }

  overrideVOPD(buttonClicked: any) {
    if (this.hasEditVopdPermission) {
      this.isCancel = false;
      this.memberVopdStatus = new MemberVopdStatus();
      this.memberVopdStatus.memberName = this.clientVopdResponses[0].firstName ? this.clientVopdResponses[0].firstName : this.rolePlayer.person.firstName;
      this.memberVopdStatus.idNumber = this.clientVopdResponses[0].idNumber ? this.clientVopdResponses[0].idNumber : null;
      this.memberVopdStatus.vopdStatus = this.clientVopdResponses[0].deceasedStatus ? this.clientVopdResponses[0].deceasedStatus : null;
      this.memberVopdStatus.dateOfDeath = this.clientVopdResponses[0].dateOfBirth ? this.clientVopdResponses[0].dateOfBirth : null;
      const canEditVopd = this.hasEditVopdPermission;
      let fileIdentifier = Guid.create().toString();
      let isAlive = null;
      let dateOfDeath: Date = null;
      if (this.memberVopdStatus.vopdStatus && this.memberVopdStatus.vopdStatus.toUpperCase().includes('DECEASED')) {
        isAlive = false;
        if (this.memberVopdStatus.dateOfDeath) {
          dateOfDeath = this.memberVopdStatus.dateOfDeath;
        }
      }
      else if (this.memberVopdStatus.vopdStatus && this.memberVopdStatus.vopdStatus.toUpperCase().includes('ALIVE')) {
        isAlive = true;
      }
      const dialogRef = this.dialog.open(VopdManualOverrideDialogComponent, { width: '800px', height: '800px', disableClose: true, data: { memberName: this.memberVopdStatus.memberName, idNumber: this.memberVopdStatus.idNumber, canEditVopd, isAlive, dateOfDeath, fileIdentifier } });
      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult) {
          this.addNotes();
          this.alertService.success('VOPD overwrite successful');
          this.clientVopdResponses = new Array();
          this.checkVopdStatus(this.rolePlayer);
        }
      });
    } else {
      this.alertService.error('User does not have permission to overwrite VOPD');
    }
  }

  addNotes() {
    const note = new Note();
    note.reason = 'VOPD overwrite'
    note.text = `VOPD overwrite successful by ${this.authService.getCurrentUser().email}`;
    note.itemId = this.personEventId;
    note.itemType = 'PersonEvent';
    note.isActive = true;
    note.modifiedBy = this.authService.getCurrentUser().email;
    this.noteService.addNote(ServiceTypeEnum.ClaimManager, note).subscribe();
  }

}
