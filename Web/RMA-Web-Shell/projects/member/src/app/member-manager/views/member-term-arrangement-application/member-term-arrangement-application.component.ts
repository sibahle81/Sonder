import { Component, OnInit } from '@angular/core';
import { LinkedUserMember } from 'projects/clientcare/src/app/policy-manager/shared/entities/linked-user-member';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';

@Component({
  templateUrl: './member-term-arrangement-application.component.html',
  styleUrls: ['./member-term-arrangement-application.component.css']
})
export class MemberTermArrangementApplication implements OnInit {

  companyId: number;
  rolePlayer: RolePlayer;

  requiredPermission = 'Manage Linked Users';
  hasPermission = false;

  linkedUserMember = new LinkedUserMember();

  constructor() { }

  ngOnInit() {
    this.hasPermission = userUtility.hasPermission(this.requiredPermission);
  }

  isContextReady(): boolean {
    const isReady = userUtility.isMemberContextReady();
    return isReady ? isReady : false;
  }

  getSelectedMemberContext(): number {
    const selectedMemberContext = userUtility.getSelectedMemberContext();
    return selectedMemberContext ? selectedMemberContext.rolePlayerId : this.companyId ? this.companyId : 0;
  }

  setRolePlayer($event) {
    this.rolePlayer = $event;
  }

  setCompanyId($event) {
    this.linkedUserMember.memberName = $event.name;
    this.companyId = $event.rolePlayerId;
    this.setRolePlayer($event);
  }

  reset() {
    this.companyId = 0;
    this.linkedUserMember = new LinkedUserMember();
  }
}
