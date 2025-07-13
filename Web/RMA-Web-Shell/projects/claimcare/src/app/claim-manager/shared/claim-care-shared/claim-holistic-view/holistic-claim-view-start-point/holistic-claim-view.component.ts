import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { EventModel } from '../../../entities/personEvent/event.model';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  selector: 'holistic-claim-view',
  templateUrl: './holistic-claim-view.component.html',
  styleUrls: ['./holistic-claim-view.component.css']
})
export class HolisticClaimViewComponent extends PermissionHelper implements OnInit{

  currentUser: User;

  @Input() eventId: number;
  @Input() defaultPEVTabIndex = 0;
  @Input() personEventId: number;
  
  rolePlayerId: number;
  selectedEvent: EventModel;
  selectedPersonEvent: PersonEventModel;

  requiredAddPermission = 'View Claim Details';
  hasAddPermission = false;
  isStp = true;
  selectedTab = 2;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly authService: AuthService,
  ) { 
    super();
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.hasAddPermission = userUtility.hasPermission(this.requiredAddPermission);
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.eventId) {
        this.eventId = params.eventId
      }
      if(params.personEventId){
        this.personEventId = params.personEventId
      }
    });
  }

  setEvent($event: EventModel) {
    this.selectedEvent = $event;
    this.rolePlayerId = this.selectedEvent.memberSiteId;
  }

  setSelectedPersonEvent($event: PersonEventModel) {
    this.selectedPersonEvent = $event;
    this.isStp = this.selectedPersonEvent.isStraightThroughProcess;
  }
}
