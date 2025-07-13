import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { DeclarationService } from 'projects/clientcare/src/app/member-manager/services/declaration.service';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ToastrManager } from 'ng6-toastr-notifications';
import "src/app/shared/extensions/date.extensions";
import { DefaultConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { CategoryInsuredEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/categoryInsuredEnum';
import { RolePlayerPolicyOnlineSubmissionContext } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy-online-submission-context';
import { RolePlayerPolicyOnlineSubmission } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy-online-submission';
import { IndustryClassDeclarationConfiguration } from 'projects/clientcare/src/app/member-manager/models/industry-class-declaration-configuration';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  selector: 'member-online-submissions',
  templateUrl: './member-online-submissions.component.html',
  styleUrls: ['./member-online-submissions.component.css']
})
export class MemberOnlineSubmissionsComponent extends UnSubscribe implements OnChanges {

  currentUser: User;

  @Input() rolePlayerId: number;
  @Input() isReadOnly = false;

  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  policies: Policy[];

  industryClassDeclarationConfiguration: IndustryClassDeclarationConfiguration;
  submissionYear = (new Date().getCorrectUCTDate().getFullYear()) + 1;
  onlineSubmissionStartDate: Date;
  applyAll = true;

  constructor(
    private readonly declarationService: DeclarationService,
    private readonly alert: ToastrManager,
    private readonly authService: AuthService,
    public dialog: MatDialog
  ) {
    super();
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.rolePlayerId) {
      this.getIndustryClassDeclarationConfiguration();
    }
  }

  getIndustryClassDeclarationConfiguration() {
    this.loadingMessage$.next('loading configuration...please wait');
    this.declarationService.getIndustryClassDeclarationConfiguration(IndustryClassEnum.Mining).subscribe(result => {
      if (result) {
        this.industryClassDeclarationConfiguration = result;
        this.onlineSubmissionStartDate = new Date(this.submissionYear - 1, this.industryClassDeclarationConfiguration.onlineSubmissionStartMonth - 1, this.industryClassDeclarationConfiguration.onlineSubmissionStartDayOfMonth);
      }

      this.getRolePlayerPolicyOnlineSubmissions();
    });
  }

  getRolePlayerPolicyOnlineSubmissions() {
    this.loadingMessage$.next('loading online submissions...please wait');
    this.declarationService.getRolePlayerPolicyOnlineSubmissions(this.rolePlayerId, this.submissionYear).subscribe(result => {
      this.policies = result;
      this.isLoading$.next(false);
    });
  }

  isOnlineSubmissionPeriodOpen(): boolean{
    const today = new Date().getCorrectUCTDate().getTime();
    return today >= this.onlineSubmissionStartDate.getTime();
  }

  canCapture(): boolean {
    return (this.policies.some(s => s.rolePlayerPolicyOnlineSubmissions.some(t => t.rolePlayerPolicyOnlineSubmissionId <= 0))) || (!this.policies.some(s => s.rolePlayerPolicyOnlineSubmissions.some(t => t.rolePlayerPolicyOnlineSubmissionId <= 0)) && this.currentUser?.isInternalUser);
  }

  canSubmit(): boolean {
    const allValid = !this.policies.some(s => s.rolePlayerPolicyOnlineSubmissions.find(t => t.rolePlayerPolicyOnlineSubmissionDetails.some(u => !u.isDeleted && (u.averageEmployeeEarnings <= 0 || u.averageNumberOfEmployees <= 0))));
    return allValid;
  }

  submit() {
    this.openConfirmationDialog();
  }

  save() {
    this.isLoading$.next(true);
    this.loadingMessage$.next('submitting online submissions...please wait');

    const rolePlayerPolicyOnlineSubmissions: RolePlayerPolicyOnlineSubmission[] = [];

    this.policies.forEach(policy => {
      policy.rolePlayerPolicyOnlineSubmissions.forEach(rolePlayerPolicyOnlineSubmission => {
        rolePlayerPolicyOnlineSubmissions.push(rolePlayerPolicyOnlineSubmission);
      });
    });

    if (rolePlayerPolicyOnlineSubmissions.length > 0) {
      if (rolePlayerPolicyOnlineSubmissions.some(s => s.rolePlayerPolicyOnlineSubmissionId > 0)) {
        this.declarationService.updateRolePlayerPolicyOnlineSubmissions(rolePlayerPolicyOnlineSubmissions).subscribe(result => {
          this.getRolePlayerPolicyOnlineSubmissions();
          this.alert.successToastr('Online Submissions updated successfully');
        });
      } else {
        this.declarationService.createRolePlayerPolicyOnlineSubmissions(rolePlayerPolicyOnlineSubmissions).subscribe(result => {
          this.getRolePlayerPolicyOnlineSubmissions();
          this.alert.successToastr('Online Submissions submitted successfully');
        });
      }
    }
  }

  openConfirmationDialog() {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: `Online Submission Confirmation`,
        text: `Are you sure you want to submit?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.save();
      }
    });
  }

  applyAllChanged($event: boolean) {
    this.applyAll = $event;
  }

  applyToAll($event: RolePlayerPolicyOnlineSubmissionContext) {
    if (this.applyAll) {
      this.policies.forEach(policy => {
        policy.rolePlayerPolicyOnlineSubmissions.forEach(rolePlayerPolicyOnlineSubmission => {
          if ($event.rolePlayerPolicyOnlineSubmission.declarationYear == rolePlayerPolicyOnlineSubmission.declarationYear) {
            rolePlayerPolicyOnlineSubmission.rolePlayerPolicyOnlineSubmissionDetails.forEach(rolePlayerPolicyOnlineSubmissionDetail => {
              if (!rolePlayerPolicyOnlineSubmissionDetail.isDeleted &&
                rolePlayerPolicyOnlineSubmissionDetail.categoryInsured == $event.rolePlayerPolicyOnlineSubmissionDetail.categoryInsured) {
                rolePlayerPolicyOnlineSubmissionDetail.averageNumberOfEmployees = $event.rolePlayerPolicyOnlineSubmissionDetail.averageNumberOfEmployees;
                rolePlayerPolicyOnlineSubmissionDetail.averageEmployeeEarnings = $event.rolePlayerPolicyOnlineSubmissionDetail.averageEmployeeEarnings;

                rolePlayerPolicyOnlineSubmissionDetail.liveInAllowance = rolePlayerPolicyOnlineSubmissionDetail.categoryInsured == CategoryInsuredEnum.Unskilled ? $event.rolePlayerPolicyOnlineSubmissionDetail.liveInAllowance : null;
              }
            });
          }
        });
      });
    }
  }
}
