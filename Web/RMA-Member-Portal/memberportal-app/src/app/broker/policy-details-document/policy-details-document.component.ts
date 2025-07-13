import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/core/models/security/user.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { ConstantApi } from 'src/app/shared/constants/constant';
import { ConstantPlaceholder } from 'src/app/shared/constants/constant-placeholder';
import { BrokerPolicyListComponent } from '../broker-policy-list/broker-policy-list.component';
import { Policy } from 'src/app/shared/models/policy';
import { MemberPortalBrokerService } from '../../member/services/member-portal-broker-service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { BrokerPolicyService } from '../services/broker-policy-service';
import { RolePlayerService } from 'src/app/shared/services/roleplayer.service';
import { ValidateEmail } from 'src/app/shared-utilities/validators/email.validator';
import { RolePlayer } from 'src/app/shared/models/roleplayer';

@Component({
  selector: 'app-policy-details-document',
  templateUrl: './policy-details-document.component.html',
  styleUrls: ['./policy-details-document.component.scss']
})
export class PolicyDetailsDocumentComponent implements OnInit {

  form: FormGroup;
  formIsValid = false;
  policyId = 0;
  userDetails: User;
  policy: Policy;
  policyOwner: RolePlayer;

  // generating Selected Report variables
  reportTitle: string;
  parametersAudit: any;
  reportServerAudit: string;
  reportUrlAudit: string;
  showParametersAudit: string;
  languageAudit: string;
  widthAudit: number;
  heightAudit: number;
  toolbarAudit: string;
  showReport = false;
  counter = 0;
  data: any;
  currentUser: string;
  currentUserObject: User;
  currentUserName: string;

  baseUrl: any;
  selectedReportType: string;
  selectedReportTypeName: string;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoadingSendEmail$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoadingDetails$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    public dialogRef: MatDialogRef<BrokerPolicyListComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private readonly formBuilder: FormBuilder,
    private readonly memberPortalBrokerService: MemberPortalBrokerService,
    private readonly alertService: AlertService,
    private readonly policyService: BrokerPolicyService,
    private readonly rolePlayerService: RolePlayerService,
    private readonly authService: AuthService) {
    this.data = data;
    this.baseUrl = this.data.BaseUrl;
  }

  ngOnInit() {
    this.createForm();
    this.policyId = this.data.policyId as number;
    this.currentUser = this.authService.getUserEmail();
    this.currentUserObject = this.authService.getCurrentUser();
    this.currentUserName = this.currentUserObject.displayName;
    this.getPolicyDetails(this.policyId);
    this.generateSelectedReport(this.policyId);
  }

  getPolicyDetails(policyId: number) {
    this.isLoadingDetails$.next(true);
    this.policyService.getPolicy(policyId).subscribe(result => {
      this.policy = result;
      this.getPolicyOwner(this.policy.policyOwnerId);
    });
    this.isLoadingDetails$.next(false);
  }

  getPolicyOwner(policyOwnerId: number) {
    this.rolePlayerService.GetMemberPortalPolicyRolePlayer(policyOwnerId).subscribe(result => {
      this.policyOwner = result;
      this.form.get('emailAddress').setValue(this.policyOwner.emailAddress);
    });
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      emailAddress: ['', [ValidateEmail]],
    });
  }

  close() {
    this.dialogRef.close(null);
  }

  emailDocument() {
    if (this.form.get('emailAddress').hasError('email')) {
      return false;
    } else {
      this.isLoadingSendEmail$.next(true);
      var emailAddress = this.form.get('emailAddress').value;
      var policyDetails = new Policy();
      policyDetails.policyOwner = new RolePlayer();

      policyDetails.paymentFrequency = this.policy.paymentFrequency;
      policyDetails.paymentMethod = this.policy.paymentMethod;
      policyDetails.policyStatus = this.policy.policyStatus;
      policyDetails.policyOwner.emailAddress = emailAddress;
      policyDetails.policyId = this.policyId;
      policyDetails.clientName = this.currentUserName;
      policyDetails.policyNumber = this.policy.policyNumber;

      if (emailAddress == '') {
        policyDetails.policyOwner.emailAddress = this.policy.policyOwner.emailAddress;
        policyDetails.clientName = this.policy.policyOwner.displayName;
      }

      this.memberPortalBrokerService.sendPolicyInformationDocument(policyDetails).subscribe((result) => {
        this.alertService.success('Emailed successfully to ' + emailAddress);
        this.isLoadingSendEmail$.next(false);
      }, error => {
        this.alertService.error('Some problem occured emailing to ' + emailAddress);
        this.isLoadingSendEmail$.next(false);
      });
    }

  }

  generateSelectedReport(PolicyId: number): void {
    this.reportTitle = this.selectedReportTypeName;
    this.parametersAudit = { PolicyId };
    this.reportServerAudit = this.baseUrl;
    this.reportUrlAudit = ConstantApi.PolicyReportUrl + ConstantPlaceholder.RMAPolicyInformationDocument;
    this.showParametersAudit = 'true';
    this.languageAudit = 'en-us';
    this.widthAudit = 100;
    this.heightAudit = 100;
    this.toolbarAudit = 'false';
    this.isLoading$.next(false);
    this.showReport = true;
  }

}
