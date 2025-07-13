import { Component, OnInit } from '@angular/core';
import { LinkedUserMember } from 'projects/clientcare/src/app/policy-manager/shared/entities/linked-user-member';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  selector: 'app-member-term-arrangement-debtor-details',
  templateUrl: './member-term-arrangement-debtor-details.component.html',
  styleUrls: ['./member-term-arrangement-debtor-details.component.css']
})
export class MemberTermArrangementDebtorDetailsComponent implements OnInit {
  companyId: number;
  rolePlayer: RolePlayer;

  requiredPermission = 'Manage Linked Users';
  hasPermission = false;

  linkedUserMember = new LinkedUserMember();

  constructor() { }

  ngOnInit(): void {
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
