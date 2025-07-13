import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { BehaviorSubject } from 'rxjs';
import { MemberComplianceDialogComponent } from '../member-compliance-dialog/member-compliance-dialog.component';
import { DeclarationService } from 'projects/clientcare/src/app/member-manager/services/declaration.service';
import { ComplianceResult } from 'projects/clientcare/src/app/policy-manager/shared/entities/compliance-result';
import { DebtorStatusEnum } from 'projects/fincare/src/app/shared/enum/debtor-status.enum';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  selector: 'member-compliance',
  templateUrl: './member-compliance.component.html',
  styleUrls: ['./member-compliance.component.css']
})
export class MemberComplianceComponent extends PermissionHelper implements OnInit, OnChanges {

  // pass in rolePlayerId for member overall compliance over all policies
  @Input() rolePlayerId: number;

  // pass in policyId for policy compliance
  @Input() policyId: number;

  //NOTE: if both inputs are supplied policyId will be the selected default

  @Output() complianceResultEmit: EventEmitter<ComplianceResult> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  complianceResult: ComplianceResult;

  termsArrangement = DebtorStatusEnum.TermsArrangement;

  constructor(
    private readonly declarationService: DeclarationService,
    public dialog: MatDialog,
    private readonly authService: AuthService,
  ) {
    super();
  }

  ngOnInit(): void {
    setInterval(() => {
      this.handle();
    }, 150000); //150000 checks every 2.5 minutes (24x per hour)
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.handle();
  }

  handle() {
    if (this.policyId && this.authService.isAuthenticated()) {
      this.getPolicyComplianceStatus();
    } else if (this.rolePlayerId && this.authService.isAuthenticated()) {
      this.getMemberComplianceStatus();
    }
  }

  getPolicyComplianceStatus() {
    this.declarationService.getPolicyComplianceStatus(this.policyId).subscribe(result => {
      this.complianceResult = result;
      this.complianceResultEmit.emit(this.complianceResult);
      this.isLoading$.next(false);
    });
  }

  getMemberComplianceStatus() {
    this.declarationService.getMemberComplianceStatus(this.rolePlayerId).subscribe(result => {
      this.complianceResult = result;
      this.complianceResultEmit.emit(this.complianceResult);
      this.isLoading$.next(false);
    });
  }

  openReasonDialog() {
    const dialogRef = this.dialog.open(MemberComplianceDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        complianceResult: this.complianceResult
      }
    });
  }

  isBillingCompliant(): boolean {
    let isCompliant = true;

    if (this.complianceResult.debtorStatus && this.complianceResult.debtorStatus == DebtorStatusEnum.TermsArrangement) {
      isCompliant = true;
    } else {
      isCompliant = this.complianceResult.isBillingCompliant;
    }

    return isCompliant;
  }

  isDeclarationCompliant(): boolean {
    return this.complianceResult.isDeclarationCompliant;
  }
}
