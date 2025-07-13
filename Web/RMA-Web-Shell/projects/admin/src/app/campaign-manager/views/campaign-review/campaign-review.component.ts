import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ListComponent } from 'projects/shared-components-lib/src/lib/list-component/list.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { TemplateService } from 'projects/admin/src/app/campaign-manager/shared/services/template-service';

import { SendEmailService } from 'projects/shared-services-lib/src/lib/services/email-request/send-email.service';
import { SendSmsService } from 'projects/shared-services-lib/src/lib/services/sms-request/send-sms.service';
import { EmailRequest } from 'projects/shared-services-lib/src/lib/services/email-request/email-request';
import { SmsMessage } from 'projects/shared-services-lib/src/lib/services/sms-request/sms-message';

import { ApprovalType } from 'projects/clientcare/src/app/shared/approvals/approvaltype';
import { Approval } from 'projects/clientcare/src/app/shared/approvals/approval';

import { CampaignReviewDataSource } from 'projects/admin/src/app/campaign-manager/views/campaign-review/campaign-review.datasource';
import { CampaignService } from 'projects/admin/src/app/campaign-manager/shared/services/campaign-service';
import { Campaign } from 'projects/admin/src/app/campaign-manager/shared/entities/campaign';
import { CampaignStatus } from 'projects/admin/src/app/campaign-manager/views/campaign-review/campaign-status';

import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ApprovalService } from 'projects/clientcare/src/app/shared/approvals/approval.service';
import { ApprovalTypeEnum } from 'projects/clientcare/src/app/shared/approvals/approval-type-enum';
import { CampaignEmailService } from 'projects/admin/src/app/campaign-manager/shared/services/campaign-email.service';
import { CampaignSmsService } from 'projects/admin/src/app/campaign-manager/shared/services/campaign-sms.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';


@Component({
  styleUrls: ['./campaign-review.component.css'],
  templateUrl: './campaign-review.component.html',
  // tslint:disable-next-line: component-selector
  selector: 'campaign-review'
})
export class CampaignReviewComponent extends ListComponent implements OnInit {

  campaign: Campaign;
  approvals: Approval[];
  approvalTypes: ApprovalType[];
  showSection = 'list';
  loadingUsers = true;
  initialising = true;
  isOwner = false;
  userRole: string;
  approvers: User[];
  canApproveCampaign = false;
  canAdd = true;
  canEdit = true;

  email = new UntypedFormControl('', [Validators.required, Validators.email]);
  mobile = new UntypedFormControl('', [Validators.required]);
  approver = new UntypedFormControl('', [Validators.required]);
  reason = new UntypedFormControl('', [Validators.required]);

  get isLoading(): boolean {
    return this.reviewDataSource.isLoading || this.initialising;
  }

  get hasCampaign(): boolean {
    if (this.campaign) {
      return this.campaign.id > 0;
    }
    return false;
  }

  get canSendMessage(): boolean {
    if (this.campaign) {
      return this.campaign.campaignType === 1 || this.campaign.campaignType === 2;
    }
    return false;
  }

  get canSendForApproval(): boolean {
    if (this.campaign) {
      return this.campaign.campaignStatus === CampaignStatus.New ||
        this.campaign.campaignStatus === CampaignStatus.Updated ||
        this.campaign.campaignStatus === CampaignStatus.MarketingApproved;
    }
    return false;
  }

  get canApprove(): boolean {
    if (this.campaign) {
      if (this.canApproveCampaign) {
        if (this.campaign.campaignStatus === CampaignStatus.MarketingApprovalRequested) {
          return this.userRole === 'Marketing' || this.userRole === 'Administrator';
        }
        if (this.campaign.campaignStatus === CampaignStatus.LegalApprovalRequested) {
          return this.userRole === 'Legal' || this.userRole === 'Administrator';
        }
      }
    }
    return false;
  }

  get hideApprovals(): boolean {
    if (this.isLoading) { return true; }
    if (!this.campaign || this.campaign.id === 0) { return true; }
    if (this.reviewDataSource.data.length === 0) { return true; }
    return false;
  }

  get hasApprovalRecords(): boolean {
    return this.reviewDataSource.data.length > 0;
  }

  constructor(
    router: Router,
    alertService: AlertService,
    private readonly datePipe: DatePipe,
    private readonly userService: UserService,
    private readonly lookupService: LookupService,
    private readonly smsService: CampaignSmsService,
    private readonly sendSmsService: SendSmsService,
    private readonly emailService: CampaignEmailService,
    private readonly sendEmailService: SendEmailService,
    private readonly campaignService: CampaignService,
    private readonly templateService: TemplateService,
    private readonly authService: AuthService,
    private readonly reviewDataSource: CampaignReviewDataSource,
    private readonly appEventsManager: AppEventsManager,
    private readonly approvalService: ApprovalService
  ) {
    super(alertService, router, reviewDataSource, '', 'Approval', 'Approvals', '', true, true, true, false);
    this.getApprovalTypes();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.initialising = true;
    this.getUserRoles();
    this.canApproveCampaign = userUtility.hasPermission('Approve Campaign');
  }

  getUserRoles(): void {
    this.lookupService.getUserRoles().subscribe(
      data => {
        const user = this.authService.getCurrentUser();
        const role = data.find(r => `${r.id}` === `${user.roleId}`);
        this.userRole = role ? role.name : '';
      }
    );
  }

  getApprovalTypes(): void {
    this.approvalTypes = [
      { id: 2, name: 'CampaignMarketingApproval', code: 'CMA', description: 'Campaign marketing approval' } as ApprovalType,
      { id: 3, name: 'CampaignLegalApproval', code: 'CLA', description: 'Campaign legal approval' } as ApprovalType
    ];
  }

  getApprovals(campaign: Campaign): void {
    if (campaign) {
      this.initialising = false;
      this.campaign = campaign;
      this.getApproverList();
      const currentUser = this.authService.getUserEmail();
      this.isOwner = currentUser === campaign.owner;
      this.reviewDataSource.getData(campaign.id);
    } else {
      this.isOwner = false;
    }
  }

  setupDisplayColumns(): void {
    this.columns = [
      { columnDefinition: 'approvalDate', header: 'Approval Date', cell: (row: Approval) => this.datePipe.transform(row.approvalDate, 'medium') },
      { columnDefinition: 'approvalBy', header: 'Approval By', cell: (row: Approval) => row.approvalBy },
      { columnDefinition: 'approvalTypeId', header: 'Approval Type', cell: (row: Approval) => this.getApprovalType(row.approvalTypeId) },
      { columnDefinition: 'approved', header: 'Approved', cell: (row: Approval) => this.getApprovalStatus(row.approved) },
      { columnDefinition: 'comment', header: 'Comment', cell: (row: Approval) => row.comment }
    ];
  }

  getApprovalType(id: number): string {
    const type = this.approvalTypes.find(approvalType => approvalType.id === id);
    if (type) {
      return type.description;
    }
    return '<unknown>';
  }

  getApprovalStatus(approved: boolean): string {
    return approved ? 'Yes' : 'No';
  }

  showApprovalList(): void {
    this.showSection = 'list';
  }

  sendReviewRequest(): void {
    this.showSection = 'review';
  }

  saveReviewRequest(): void {
    this.appEventsManager.loadingStart('Sending review request...');
    this.campaignService.sendReviewRequest(this.campaign).subscribe(
      () => {
        this.campaign.campaignStatus = this.campaign.campaignStatus === CampaignStatus.New || this.campaign.campaignStatus === CampaignStatus.Updated ?
          CampaignStatus.MarketingApprovalRequested :
          CampaignStatus.LegalApprovalRequested;
        this.alertService.success('Campaign successfully sent for review.');
        this.appEventsManager.loadingStop();
        this.showApprovalList();
      },
      error => {
        this.alertService.error(error);
        this.appEventsManager.loadingStop();
      }
    );
  }

  getApproverList(): void {
    this.loadingUsers = true;
    let role = '';
    if (this.campaign.campaignStatus === CampaignStatus.New || this.campaign.campaignStatus === CampaignStatus.Updated) {
      role = 'Marketing';
    } else if (this.campaign.campaignStatus === CampaignStatus.MarketingApproved) {
      role = 'Legal';
    } else {
      return;
    }

    this.userService.getUsersByRoleName(role).subscribe(
      data => {
        this.approvers = data;
        // TODO: remove test code
        const user = this.authService.getCurrentUser();
        this.approvers.push(user);
      }
    );
  }

  setApproval(status: number): void {
    this.reason.setValue('');
    switch (status) {
      case 1: // Approve
        this.showSection = 'approve';
        break;
      case 2: // Dispute
        this.showSection = 'dispute';
        break;
      case 3: // Reject
        this.showSection = 'reject';
        break;
    }
  }

  approveCampaign(): void {
    let status = 0;
    let approvalType: ApprovalTypeEnum = null;
    if (this.campaign.campaignStatus === CampaignStatus.MarketingApprovalRequested) {
      approvalType = ApprovalTypeEnum.CampaignMarketingApproval;
      status = CampaignStatus.MarketingApproved;
    } else if (this.campaign.campaignStatus === CampaignStatus.LegalApprovalRequested) {
      approvalType = ApprovalTypeEnum.CampaignLegalApproval;
      status = CampaignStatus.LegalApproved;
    }
    if (status !== 0) {
      this.appEventsManager.loadingStart('Saving approval status...');
      const approval = this.getNewApproval(approvalType, true);
      this.saveApproval(approval, status);
    }
  }

  rejectCampaign(): void {
    this.appEventsManager.loadingStart('Saving approval status...');
    const status = CampaignStatus.Rejected;
    let approvalType: ApprovalTypeEnum = null;
    if (this.campaign.campaignStatus === CampaignStatus.MarketingApprovalRequested) {
      approvalType = ApprovalTypeEnum.CampaignMarketingApproval;
    } else if (this.campaign.campaignStatus === CampaignStatus.LegalApprovalRequested) {
      approvalType = ApprovalTypeEnum.CampaignLegalApproval;
    }
    const approval = this.getNewApproval(approvalType, false);
    this.saveApproval(approval, status);
  }

  getNewApproval(approvalType: ApprovalTypeEnum, approved: boolean): Approval {
    const approval = new Approval();
    approval.id = 0;
    approval.itemId = this.campaign.id;
    approval.itemType = 'Campaign';
    approval.approvalTypeId = approvalType as number;
    approval.approved = approved;
    approval.comment = '';
    approval.approvalDate = new Date();
    approval.approvalBy = this.authService.getUserEmail();
    return approval;
  }

  saveApproval(approval: Approval, status: number): void {
    const reason = this.reason.value;
    approval.comment += `\r\n${reason}`;
    approval.comment = approval.comment.trim();
    if (approval.id === 0) {
      this.approvalService.addApproval(approval).subscribe(
        () => {
          this.alertService.success('Approval successfully updated.');
          this.saveCampaign(status);
        },
        error => {
          this.appEventsManager.loadingStop();
          this.alertService.error(error);
        }
      );
    } else {
      this.approvalService.editApprovalData(approval).subscribe(
        () => {
          this.alertService.success('Approval successfully updated.');
          this.saveCampaign(status);
        },
        error => {
          this.appEventsManager.loadingStop();
          this.alertService.error(error);
        }
      );
    }
  }

  saveCampaign(status: number): void {
    this.campaign.campaignStatus = status;
    this.appEventsManager.loadingStart('Updating campaign status...');
    this.campaignService.editCampaign(this.campaign).subscribe(
      () => {
        this.appEventsManager.loadingStop();
        this.getApprovals(this.campaign);
        this.showApprovalList();
        this.alertService.success('Campaign successfully updated.');
      },
      error => {
        this.appEventsManager.loadingStop();
        this.getApprovals(this.campaign);
        this.alertService.error(error);
      }
    );
  }

  sendTemplateTest(): void {
    if (this.campaign.campaignType === 1) {
      this.email.setValue(this.authService.getUserEmail());
      this.showSection = 'testEmail';
    } else {
      this.mobile.setValue('');
      this.showSection = 'testSms';
    }
  }

  sendTestEmail(): void {

    if (this.email.invalid) { return; }

    this.appEventsManager.loadingStart('Sending test email...');

    this.emailService.getCampaignEmail(this.campaign.id).subscribe(
      data => {
        const emailRequest = new EmailRequest();
        emailRequest.subject = `${this.campaign.name} :: Test Email`;
        emailRequest.fromAddress = this.authService.getUserEmail();
        emailRequest.recipients = this.email.value;
        emailRequest.body = '';
        emailRequest.isHtml = true;
        emailRequest.emailId = data.id;

        this.sendEmailService.sendEmail(emailRequest).subscribe(
          code => {
            switch (code) {
              case 200:
                this.alertService.success('Email successfully sent.');
                break;
              case 201:
                this.alertService.success('Email accepted by the server.');
                break;
              case 202:
                this.alertService.success('Email successfully queued for transmission.');
                break;
              default:
                this.alertService.error(`Email transmission error ${code}.`);
            }
            this.appEventsManager.loadingStop();
            this.showApprovalList();
          },
          error => {
            this.alertService.error(error);
            this.appEventsManager.loadingStop();
          }
        );
      },
      error => {
        this.alertService.error(error);
        this.appEventsManager.loadingStop();
      }
    );
  }

  sendTestSms(): void {
    if (this.mobile.invalid) { return; }

    this.smsService.getCampaignSms(this.campaign.id).subscribe(
      sms => {
        this.templateService.getMessageContent('Sms', sms.id).subscribe(
          content => {
            const message = this.getSmsMessage(content.content);
            this.sendSmsService.send(message).subscribe(
              data => {
                if (data >= 0) {
                  this.alertService.success('Sms successfully scheduled.');
                } else {
                  this.alertService.error('Sms could not be scheduled.');
                }
                this.appEventsManager.loadingStop();
              },
              error => {
                this.appEventsManager.showError(error);
                this.appEventsManager.loadingStop();
              }
            );
          }
        );
      },
      error => {
        this.alertService.error(error);
        this.appEventsManager.loadingStop();
      }
    );
  }

  getSmsMessage(text: string): SmsMessage {
    const message = new SmsMessage();
    message.message = text;
    message.smsNumbers = [this.mobile.value];
    return message;
  }

}
