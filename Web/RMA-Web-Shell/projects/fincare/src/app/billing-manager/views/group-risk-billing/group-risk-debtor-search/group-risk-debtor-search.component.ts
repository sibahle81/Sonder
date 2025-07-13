import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BenefitPayroll } from 'projects/clientcare/src/app/policy-manager/shared/entities/benefit-payroll';
import { Invoice } from 'projects/fincare/src/app/shared/models/invoice';
import { Transactions } from 'projects/fincare/src/app/shared/models/transactions';
import { DefaultConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { DebtorSearchResult } from 'projects/shared-components-lib/src/lib/models/debtor-search-result';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-group-risk-debtor-search',
  templateUrl: './group-risk-debtor-search.component.html',
  styleUrls: ['./group-risk-debtor-search.component.css']
})
export class GroupRiskDebtorSearchComponent implements OnInit {

  selectedRolePlayer: DebtorSearchResult;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private readonly router: Router,
    private readonly wizardService: WizardService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly alertService: AlertService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    
  }

  memberSelected($event: DebtorSearchResult) {
    this.selectedRolePlayer = $event;
    this.openMessageDialog();
  }

  openMessageDialog() {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: `New Group Risk Billing Confirmation`,
        text: `Are you sure you want to create billing for this member?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.startWizard();
      } else {
        this.isLoading$.next(false);
      }
    });
  }

  startWizard() {
    this.isLoading$.next(true);
    const startWizardRequest = new StartWizardRequest();

    let benefitPayroll = new BenefitPayroll();
    benefitPayroll.rolePlayerId = this.selectedRolePlayer.roleplayerId;

    startWizardRequest.data = JSON.stringify(benefitPayroll);
    startWizardRequest.type = 'manage-grouprisk-billing';
    startWizardRequest.linkedItemId = benefitPayroll.benefitPayrollId;

    this.createWizard(startWizardRequest);
  }

  createWizard(startWizardRequest: StartWizardRequest) {
    this.wizardService.startWizard(startWizardRequest).subscribe(result => {
      this.router.navigate(['/fincare/billing-manager/manage-grouprisk-billing/continue/', result.id]);
      this.alertService.success('Wizard created successfully');
    });
  }
}



