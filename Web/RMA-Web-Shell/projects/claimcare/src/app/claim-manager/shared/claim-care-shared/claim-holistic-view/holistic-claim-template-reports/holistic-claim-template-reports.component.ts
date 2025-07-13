import { Component, Input, OnChanges } from '@angular/core';
import { ToastrManager } from 'ng6-toastr-notifications';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { SsrsReportViewerDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/ssrs-report-viewer-dialog/ssrs-report-viewer-dialog.component';
import { DefaultConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { KeyValue } from '@angular/common';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { User } from 'projects/shared-models-lib/src/lib/security/user';

@Component({
  selector: 'holistic-claim-template-reports',
  templateUrl: './holistic-claim-template-reports.component.html',
  styleUrls: ['./holistic-claim-template-reports.component.css']
})
export class HolisticClaimTemplateReportsComponent extends UnSubscribe implements OnChanges {

  @Input() personEvent: PersonEventModel;

  currentUser: User;

  reports = [
    { key: 'Section 91 Notice of Objection', value: 'RMA.Reports.ClaimCare/RMASection91NoticeOfObjection' },
    { key: 'Section 90 Review Notice', value: 'RMA.Reports.ClaimCare/RMASection90ReviewNotice' },
  ];

  selectedReport: any;
  reportUrl: string;
  parameters: KeyValue<string, number>[];

  constructor(
    private readonly dialog: MatDialog,
    private readonly alertService: ToastrManager,
    private readonly wizardService: WizardService,
    private readonly authService: AuthService,
  ) {
    super();
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnChanges() {
    if (this.personEvent) {
      this.setParameters();
    }
  }

  reportSelected($event: any) {
    this.selectedReport = $event;
    this.reportUrl = this.selectedReport.value;
  }

  setParameters() {
    const parameters = [
      { key: 'PersonEventId', value: this.personEvent.personEventId },
    ];
    this.parameters = parameters;
  }

  openReportViewerDialog() {
    const dialogRef = this.dialog.open(SsrsReportViewerDialogComponent, {
      width: '70%',
      disableClose: true,
      data: {
        title: this.selectedReport.key,
        reporturl: this.reportUrl,
        parameters: this.parameters,
        auditViewers: true, // audit who views this document
        itemType: this.selectedReport.key,
        itemId: this.personEvent.personEventId
      }
    });

    dialogRef.afterClosed().subscribe(results => { 
      if (results) {
        const downloadCompleted = results.some(result => result.action === 'downloaded');
        if (downloadCompleted
            && this.selectedReport.key === 'Section 90 Review Notice') {
          this.openConfirmationDialog();
        }
      }
    });
  }

  reset() {  }

  openConfirmationDialog() {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: `Confirm Workflow Creation`,
        text: `${this.selectedReport.key} workflow will be created...Would you like to proceed?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.startSection90ReviewReportWizard();
      }
    });
  }

  startSection90ReviewReportWizard() {
    this.alertService.warningToastr(`${this.selectedReport.key} workflow is starting...`);
    
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.linkedItemId = this.personEvent.personEventId;
    startWizardRequest.type = 'upload-section90-review-report';
    startWizardRequest.data = JSON.stringify(this.personEvent);
    startWizardRequest.lockedToUser = this.currentUser.email;
    startWizardRequest.allowMultipleWizards = false;
    
    this.wizardService.startWizard(startWizardRequest).subscribe(result => {
      this.alertService.successToastr(`${this.selectedReport.key} workflow created successfully`);
    });
  }
}
