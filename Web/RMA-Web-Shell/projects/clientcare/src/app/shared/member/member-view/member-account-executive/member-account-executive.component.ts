import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { BehaviorSubject } from 'rxjs';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';

@Component({
  selector: 'member-account-executive',
  templateUrl: './member-account-executive.component.html',
  styleUrls: ['./member-account-executive.component.css']
})
export class MemberAccountExecutiveComponent extends PermissionHelper implements OnChanges {

  addPermission = 'Add Member';
  editPermission = 'Edit Member';
  viewPermission = 'View Member';
  viewAuditPermission = 'View Audits';

  @Input() member: RolePlayer;
  @Input() isWizard: boolean;
  @Input() isReadOnly = false;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  accountExecutive: User;
  showSearch: boolean;

  requiredPermission = 'Manage Member Account Executive';

  constructor(
    private readonly userService: UserService,
    private readonly memberService: MemberService,
  ) {
    super();
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (this.member.accountExecutiveId) {
      this.getUser();
    }
  }

  delete() {
    this.accountExecutive = null;
    this.member.accountExecutiveId = null;
    this.save();
  }

  toggle() {
    this.showSearch = !this.showSearch;
  }

  userSelected($event: User[]) {
    this.accountExecutive = $event[0];
    this.member.accountExecutiveId = this.accountExecutive.id;
    this.toggle();
    this.save();
  }

  getUser() {
    this.isLoading$.next(true);
    if (this.member.accountExecutiveId) {
      this.userService.getUser(this.member.accountExecutiveId).subscribe(result => {
        if (result) {
          this.accountExecutive = result;
        }
        this.isLoading$.next(false);
      });
    } else {
      this.isLoading$.next(false);
    }
  }

  save() {
    if (!this.isWizard) {
      this.isLoading$.next(true);
      this.memberService.updateMember(this.member).subscribe(() => {
        this.isLoading$.next(false);
      });
    }
  }
}
