import { Component, OnInit } from '@angular/core';
import { LinkedUserMember } from 'projects/clientcare/src/app/policy-manager/shared/entities/linked-user-member';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  templateUrl: './hcp-member-user-administration.component.html',
  styleUrls: ['./hcp-member-user-administration.component.css']
})
export class HCPMemberUserAdministrationComponent implements OnInit {

  healthCareProviderId: number;

  requiredPermission = 'Manage Linked Users';
  hasPermission = false;

  linkedUserMember = new LinkedUserMember(); //will change once api's are in place
  isInternalUser: boolean;
  healthcareproviderId: number;
  userId: number;

  constructor(private readonly authService: AuthService, private readonly userService: UserService) {
    this.getHealthcareProviderId()
  }

  ngOnInit() {
    this.isInternalUser = this.authService.getCurrentUser().isInternalUser;
    this.hasPermission = userUtility.hasPermission(this.requiredPermission);
  }

  isContextReady(): boolean {
    const isReady = userUtility.isMemberContextReady();
    return isReady ? isReady : false;
  }

  async getHealthcareProviderId() {
    this.userId = this.authService.getCurrentUser().id > 0 ? this.authService.getCurrentUser().id : 0;
    let hcpId = await this.userService.getHealthCareProviderIdLinkedToExternalUser(this.userId).toPromise();
    this.healthcareproviderId = hcpId;
  }

  setHealthCareProviderId($event) {
    this.linkedUserMember.memberName = $event.name;
    this.healthCareProviderId = $event.rolePlayerId;
  }

  reset() {
    this.healthCareProviderId = 0;
    this.linkedUserMember = new LinkedUserMember(); //will change once api's are in place
  }
}
