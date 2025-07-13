import { Component, OnInit } from '@angular/core';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { EventModel } from '../../shared/entities/personEvent/event.model';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { ActivatedRoute, Router } from '@angular/router';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { EventTypeEnum } from '../../shared/enums/event-type-enum';
import { BehaviorSubject } from 'rxjs';
import { DefaultConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  templateUrl: './claim-member-search.component.html',
  styleUrls: ['./claim-member-search.component.css']
})
export class ClaimMemberSearchComponent implements OnInit {

  title: string;
  eventType: EventTypeEnum;
  selectedRolePlayer: RolePlayer;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private readonly router: Router,
    private readonly wizardService: WizardService,
    private readonly activatedRoute: ActivatedRoute,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.eventType = +params.eventTypeId;
      this.title = `Register New ${EventTypeEnum[this.eventType]} Claim Notification: Search Member Site`;
    });
  }

  getEventTypeName(): string {
    return this.eventType ? EventTypeEnum[this.eventType] : '';
  }

  memberSelected($event: RolePlayer) {
    this.selectedRolePlayer = $event;
    this.openMessageDialog();
  }

  openMessageDialog() {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: `New ${this.getEventTypeName()} Notification Confirmation`,
        text: `Are you sure you want to register a new ${this.getEventTypeName()} notification?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.startWizard();
      } else {
        this.isLoading$.next(false);
      }
    });
  }

  startWizard() {
    this.isLoading$.next(true);
    const startWizardRequest = new StartWizardRequest();

    let event = new EventModel();
    event.memberSiteId = this.selectedRolePlayer.rolePlayerId;

    startWizardRequest.data = JSON.stringify(event);
    startWizardRequest.type = this.eventType == EventTypeEnum.Accident ? 'accident-claim' : 'disease-claim';;
    startWizardRequest.linkedItemId = event.eventId;

    this.createWizard(startWizardRequest);
  }

  createWizard(startWizardRequest: StartWizardRequest) {
    this.wizardService.startWizard(startWizardRequest).subscribe(result => {
      if (startWizardRequest.type === 'accident-claim') {
        this.router.navigate(['/claimcare/claim-manager/accident-claim/continue/', result.id]);
      }
      if (startWizardRequest.type === 'disease-claim') {
        this.router.navigate(['/claimcare/claim-manager/disease-claim/continue/', result.id]);
      }
    });
  }
}



