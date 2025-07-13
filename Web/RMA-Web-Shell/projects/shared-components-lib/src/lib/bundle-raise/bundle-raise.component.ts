import { PaymentFrequencyEnum } from 'projects/shared-models-lib/src/lib/enums/payment-frequency.enum';
import { Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { StartWizardRequest } from './../wizard/shared/models/start-wizard-request';
import { BehaviorSubject } from 'rxjs';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { PolicyStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-status.enum';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { WizardService } from '../wizard/shared/services/wizard.service';
import { BundleRaise } from 'projects/fincare/src/app/billing-manager/models/bundle-raise';
import { Declaration } from 'projects/clientcare/src/app/policy-manager/shared/entities/declaration';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DeclarationDialogComponent } from './declaration-dialog/declaration-dialog.component';

@Component({
  selector: 'lib-bundle-raise',
  templateUrl: './bundle-raise.component.html',
  styleUrls: ['./bundle-raise.component.css']
})
export class BundleRaiseComponent implements OnInit, OnChanges {

  @Input() isWizard = false;
  @Input() isReadOnly = false;
  @Input() policies: Policy[];

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  selectedPolicies: Policy[] = [];

  paymentFrequencies: any[];
  raiseDate = new Date();

  constructor(
    private readonly router: Router,
    private readonly policyService: PolicyService,
    private readonly wizardService: WizardService,
    private readonly alert: ToastrManager,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    if (this.isWizard) { return; }
    this.isLoading$.next(true);
    this.policyService.getPoliciesWithStatus(PolicyStatusEnum.PendingRelease).subscribe(result => {
      this.policies = result;
      this.isLoading$.next(false);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.policies) { return; }
    this.selectedPolicies = this.policies.filter(s => s.policyStatus === PolicyStatusEnum.PendingFirstPremium);
  }

  selectAll() {
    if (this.selectedPolicies.length < this.policies.length) {
      this.selectedPolicies = [];
      this.policies.forEach(s => {
        this.selectedPolicies.push(s);
        if (this.isWizard) {
          this.policies.forEach(t => t.policyStatus = PolicyStatusEnum.PendingFirstPremium);
        }
      });
    } else {
      this.selectedPolicies = [];
      if (this.isWizard) {
        this.policies.forEach(t => t.policyStatus = PolicyStatusEnum.Released);
      }
    }
  }

  toggle(policy: Policy) {
    if (this.selectedPolicies.includes(policy)) {
      const index = this.selectedPolicies.indexOf(policy);
      this.selectedPolicies.splice(index, 1);
    } else { this.selectedPolicies.push(policy); }

    if (this.isWizard) {
      if (policy.policyStatus === PolicyStatusEnum.Released) {
        policy.policyStatus = PolicyStatusEnum.PendingFirstPremium;
        policy.policyStatusId = PolicyStatusEnum.PendingFirstPremium;
      } else {
        policy.policyStatus = PolicyStatusEnum.Released;
        policy.policyStatusId = PolicyStatusEnum.Released;
      }
      const index = this.policies.indexOf(policy);
      this.policies[index] = policy;
    }
  }

  viewDeclaration(declarations$: Declaration[]) {
    const config = new MatDialogConfig();
    config.disableClose = true;
    config.data = {
      declarations: declarations$,
      isReadOnly: true
    };

    const dialog = this.dialog.open(DeclarationDialogComponent, config);
    dialog.afterClosed().subscribe(() => { });
  }

  submit() {
    this.isLoading$.next(true);

    const request = new StartWizardRequest();
    request.type = 'Bundle-Raise';
    const bundleRaise = new BundleRaise();
    bundleRaise.policies = this.selectedPolicies;
    bundleRaise.bundleRaiseNotes = [];
    request.data = JSON.stringify(bundleRaise);

    this.wizardService.startWizard(request).subscribe(result => {
      this.alert.successToastr('Bundle raise submitted successfully...');
      this.router.navigateByUrl('clientcare/policy-manager');
      this.isLoading$.next(false);
    });
  }

  formatPolicyStatus(policyStatusId: number): string {
    return this.format(PolicyStatusEnum[policyStatusId]);
  }

  formatPaymentFrequency(paymentFrequencyId: number): string {
    return this.format(PaymentFrequencyEnum[paymentFrequencyId]);
  }

  format(text: string) {
    return text.replace(/([A-Z])/g, ' $1').trim();
  }
}
