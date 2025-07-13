import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { ReportViewedAudit } from 'projects/shared-models-lib/src/lib/common/audits/report-viewed-audit';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AuditLogService } from '../../audit/audit-log.service';
import "src/app/shared/extensions/date.extensions";

@Component({
  templateUrl: './ssrs-report-viewer-dialog.component.html',
  styleUrls: ['./ssrs-report-viewer-dialog.component.css']
})

export class SsrsReportViewerDialogComponent extends PermissionHelper implements OnInit {

  viewAuditPermission = 'View Audits';

  title = 'Ssrs Report Viewer'; // default title if no title is supplied
  reporturl: string;
  parameters: any[];

  // To track who viewed/downloaded the report, the below is needed
  auditViewers = false; // audit who views this document: default = false
  itemType: string;
  itemId: number;

  triggerRefresh: boolean;
  recentActivity: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<SsrsReportViewerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly authService: AuthService,
    private readonly auditLogService: AuditLogService
  ) {
    super();
  }

  ngOnInit() {
    if (this.data && this.data.parameters && this.data.parameters.length > 0 && this.data.reporturl && this.data.reporturl != '') {
      this.auditViewers = this.data.auditViewers ? this.data.auditViewers : false;
      this.title = this.data.title ? this.data.title : this.title;

      this.parameters = this.data.parameters;
      this.reporturl = this.data.reporturl;

      this.itemType = this.data.itemType;
      this.itemId = this.data.itemId;
    }
  }

  addAudit($event: boolean, action: string) {
    if ($event && this.auditViewers) {
      const reportViewedAudit = new ReportViewedAudit();
      reportViewedAudit.reportUrl = this.reporturl;

      reportViewedAudit.action = action;
      reportViewedAudit.actionDate = new Date().getCorrectUCTDate();

      reportViewedAudit.itemId = this.itemId;
      reportViewedAudit.itemType = this.itemType;

      const user = this.authService.getCurrentUser();
      reportViewedAudit.userId = user.id;

      this.recentActivity.push(reportViewedAudit);

      this.auditLogService.createReportViewedAudit(reportViewedAudit).subscribe(result => {
        this.refresh();
      });
    }
  }

  refresh() {
    this.triggerRefresh = !this.triggerRefresh;
  }

  close() {
      this.dialogRef.close(this.recentActivity);
  }
}
