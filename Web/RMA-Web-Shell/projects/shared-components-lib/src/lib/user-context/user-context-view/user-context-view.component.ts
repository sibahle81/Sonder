import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';
import { LinkedUserMember } from 'projects/clientcare/src/app/policy-manager/shared/entities/linked-user-member';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { BehaviorSubject } from 'rxjs';
import { UserContextDialogComponent } from '../user-context-dialog/user-context-dialog.component';
import { UserCompanyMapStatusEnum } from 'projects/shared-models-lib/src/lib/enums/user-company-map-status-enum';

@Component({
    selector: 'user-context-view',
    templateUrl: './user-context-view.component.html',
    styleUrls: ['./user-context-view.component.css']
})

export class UserContextViewComponent implements OnInit {

    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

    userId: number;
    selectedUserContext: LinkedUserMember;

    supportedRoleNames = ['Member', 'Agent', 'Member Payroll'];
    showIcon = false;

    constructor(
        public dialog: MatDialog,
        private authService: AuthService,
        private readonly memberService: MemberService
    ) { }

    ngOnInit() {
        const user = this.authService.getCurrentUser();

        this.userId = user.id;
        this.showIcon = this.isSupportedRole(user.roleName);

        userUtility.clearSelectedLinkedUserContext();
        userUtility.setMemberContextReady(false);

        this.getDefault();
    }

    isSupportedRole(roleName: string): boolean {
        return this.supportedRoleNames.includes(roleName);
    }

    getDefault() {
        this.memberService.getLinkedUserMembers(this.userId).subscribe(results => {
            if (results && results.length > 0) {
                const defaultIndex = results.findIndex(s => s.userCompanyMapStatus == UserCompanyMapStatusEnum.Active);
                if (defaultIndex > -1) {
                    this.setContext(results[defaultIndex]);
                }
            }
            userUtility.setMemberContextReady(true);
            this.isLoading$.next(false);
        });
    }

    setContext(result: LinkedUserMember) {
        userUtility.clearSelectedLinkedUserContext();
        this.selectedUserContext = result;
        userUtility.setSelectedLinkedUserContext(this.selectedUserContext);
    }

    openUserContextDialog() {
        const dialogRef = this.dialog.open(UserContextDialogComponent, {
            width: '70%',
            disableClose: true,
            data: { userId: this.userId }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.setContext(result);
            }
        });
    }
}
