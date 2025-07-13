import { DatePipe } from '@angular/common';
import {
  Component,
  Inject,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuditLogService } from 'projects/shared-components-lib/src/lib/audit/audit-log.service';
import {
  AuditLogPropertyDetail,
  AuditResult,
} from 'projects/shared-components-lib/src/lib/audit/audit-models';
import { ClaimLiabilityStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-liability-status.enum';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { BehaviorSubject } from 'rxjs';
import { ItemType } from '../../shared/enums/item-type';

@Component({
  selector: 'app-claim-audit-view',
  templateUrl: './claim-audit-view.component.html',
  styleUrls: ['./claim-audit-view.component.css'],
})
export class ClaimAuditViewComponent implements OnInit, OnChanges {
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isLoadingUserDisplayName$: BehaviorSubject<boolean> = new BehaviorSubject(
    false
  );

  auditResults: AuditResult[] = [];
  logs: string[] = [];

  userDisplayName: string;
  originalLogEntry: string;

  includedPropertyNames: string[] = ['Claim Status', 'Claim Liability Status'];

  constructor(
    public dialog: MatDialogRef<ClaimAuditViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly datepipe: DatePipe,
    private readonly auditService: AuditLogService,
    private readonly userService: UserService
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.getAuditLogs();
    } else {
      this.isLoading$.next(false);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.isLoading$.next(true);
    if (this.data) {
      this.getAuditLogs();
    }
  }

  getAuditLogs() {
    const itemTypeId = this.data.itemType;
    this.auditService
      .getAuditLogs(ServiceTypeEnum.ClaimManager, itemTypeId, this.data.itemId)
      .subscribe((results) => {
        this.auditResults = results.sort((a, b) => {
          return <any>new Date(b.date) - <any>new Date(a.date);
        });
        this.auditResults.forEach((result) => {
          result.propertyDetails.forEach((detail) => {
            if (detail.hasChanged) {
              this.createChangedPropertyStoryLogEntry(result, detail);
            }
          });
        });
        this.isLoading$.next(false);
      });
  }

  createChangedPropertyStoryLogEntry(
    result: AuditResult,
    detail: AuditLogPropertyDetail
  ) {
    const createdDate = this.datepipe.transform(
      result.date,
      'yyyy-MM-dd HH:mm:ss'
    );
    if (result.action === 'Added') {
      if (this.includedPropertyNames.includes(detail.propertyName)) {
        this.logs.push(
          `${detail.propertyName} - ${this.getEnumDescription(
            detail.propertyName,
            detail.newValue
          )} was ${result.action} by ${result.username} on ${createdDate}`
        );
      }
    } else if (result.action === 'Modified') {
      if (this.includedPropertyNames.includes(detail.propertyName)) {
        this.logs.push(
          `${detail.propertyName} was ${
            result.action
          } from ${this.getEnumDescription(
            detail.propertyName,
            detail.oldValue
          )} to ${this.getEnumDescription(
            detail.propertyName,
            detail.newValue
          )} by ${result.username} on ${createdDate}`
        );
      } else if (this.includedPropertyNames.includes(detail.propertyName)) {
        this.logs.push(
          `A ${detail.propertyName} were ${result.action} by ${result.username} on ${createdDate}`
        );
      }
    }
  }

  getEnumDescription(propertyName: string, propertyValue: any) {
    switch (propertyName) {
      case 'Claim Status':
        return this.splitEnumValue(ClaimStatusEnum[propertyValue]);
      case 'Claim Liability Status':
        return this.splitEnumValue(ClaimLiabilityStatusEnum[propertyValue]);
      default:
        return propertyValue;
    }
  }

  splitEnumValue(item: string): string {
    const result = item.split(/(?=[A-Z])/);
    let splitword = '';
    result.forEach((item) => {
      splitword += ` ${item}`;
    });
    return splitword;
  }

  getUser(log: string) {
    this.isLoadingUserDisplayName$.next(true);
    const oldLog = log;
    if (log.includes('@')) {
      this.originalLogEntry = log;
    } else {
      return;
    }
    const from = log.indexOf('by ');
    const to = log.lastIndexOf(' on');
    const email = log.substring(from + 3, to);

    this.userService.getUserDetails(email).subscribe((result) => {
      this.userDisplayName = result.displayName;

      const newLog = log.replace(email, this.userDisplayName);
      const logIndex = this.logs.indexOf(oldLog);
      this.logs[logIndex] = newLog;
      this.isLoadingUserDisplayName$.next(false);
    });
  }

  clearUser(log: string) {
    this.isLoadingUserDisplayName$.next(true);
    const newLog = log;
    const oldLog = this.originalLogEntry;
    const logIndex = this.logs.indexOf(newLog);
    this.logs[logIndex] = oldLog;
    this.isLoadingUserDisplayName$.next(false);
  }

  closeDialog(): void {
    this.dialog.close();
  }
}
