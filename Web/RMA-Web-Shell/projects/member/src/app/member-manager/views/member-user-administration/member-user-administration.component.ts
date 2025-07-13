import { Component, OnInit } from '@angular/core';
import { LinkedUserMember } from 'projects/clientcare/src/app/policy-manager/shared/entities/linked-user-member';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  templateUrl: './member-user-administration.component.html',
  styleUrls: ['./member-user-administration.component.css']
})
export class MemberUserAdministrationComponent implements OnInit {

  rolePlayerId: number;

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
    return selectedMemberContext ? selectedMemberContext.rolePlayerId : this.rolePlayerId ? this.rolePlayerId : 0;
  }

  setRolePlayer($event) {
    this.linkedUserMember.memberName = $event.displayName;
    this.rolePlayerId = $event.rolePlayerId;
  }

  reset() {
    this.rolePlayerId = 0;
    this.linkedUserMember = new LinkedUserMember();
  }
}
