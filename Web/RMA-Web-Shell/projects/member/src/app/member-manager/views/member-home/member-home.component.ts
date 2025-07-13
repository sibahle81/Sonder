import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LinkedUserMember } from 'projects/clientcare/src/app/policy-manager/shared/entities/linked-user-member';
import { QuoteV2 } from 'projects/clientcare/src/app/quote-manager/models/quoteV2';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { BehaviorSubject } from 'rxjs';
import { QuoteViewDialogComponent } from './quote-view-dialog/quote-view-dialog.component';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { PersonEvent } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/person-event';
import { EventHolisticViewDialogComponent } from './event-holistic-view-dialog/event-holistic-view-dialog.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './member-home.component.html',
  styleUrls: ['./member-home.component.css']
})
export class MemberHomeComponent extends PermissionHelper implements OnInit {

  viewMemberPermission = 'Member View';
  viewPolicyPermission = 'Policy View';
  viewClaimPermission = 'Claim View';

  createClaimsPermission = 'Create Claim';

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  rolePlayerId: number;

  selectedPolicy: Policy;
  selectedTabIndex = 0;

  linkedUserMember = new LinkedUserMember();

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    public dialog: MatDialog
  ) {
    super();
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.selectedTabIndex) {
        this.selectedTabIndex = params.selectedTabIndex;
      }
    });
  }

  isContextReady(): boolean {
    const isReady = userUtility.isMemberContextReady();
    return isReady ? isReady : false;
  }

  getSelectedMemberContext(): number {
    const selectedMemberContext = userUtility.getSelectedMemberContext();
    return selectedMemberContext ? selectedMemberContext.rolePlayerId : this.rolePlayerId ? this.rolePlayerId : 0;
  }

  setRolePlayer($event: RolePlayer) {
    this.linkedUserMember.memberName = $event.displayName;
    this.rolePlayerId = $event.rolePlayerId;
  }

  openQuoteDialog($event: QuoteV2) {
    const dialogRef = this.dialog.open(QuoteViewDialogComponent, {
      autoFocus: false,
      maxHeight: '90vh',
      width: '80%',
      disableClose: true,
      data: {
        quoteId: +$event.quoteId
      }
    });
  }

  reset() {
    this.rolePlayerId = 0;
    this.linkedUserMember = new LinkedUserMember();
  }

  setSelectedPolicy($event: Policy) {
    this.selectedPolicy = $event;
  }

  setPEV($event: PersonEvent) {
    this.openEventDialog($event.eventId, $event.personEventId);
  }

  openEventDialog(eventId: number, personEventId: number) {
    const dialogRef = this.dialog.open(EventHolisticViewDialogComponent, {
      autoFocus: false,
      maxHeight: '90vh',
      width: '100%',
      disableClose: true,
      data: {
        eventId: +eventId,
        personEventId: +personEventId
      }
    });
  }
}
