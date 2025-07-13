import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { PolicyStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-status.enum';
import { ProductCategoryTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/product-category-type.enum';
import { Product } from 'projects/clientcare/src/app/product-manager/models/product';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { PolicyService } from 'projects/fincare/src/app/shared/services/policy.service';
import { RemittanceReportDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/remittance-report-dialog/remittance-report-dialog.component';
import { SsrsReportViewerDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/ssrs-report-viewer-dialog/ssrs-report-viewer-dialog.component';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'policy-list',
  templateUrl: './policy-list.component.html',
  styleUrls: ['./policy-list.component.css']
})
export class PolicyListComponent extends UnSubscribe implements OnChanges {

  currentUser: User;

  @Input() rolePlayerId: number;
  @Input() isWizard: boolean; // optional input: behave in the wizard context or not
  @Input() isReadOnly = false; // optional input: force readonly

  @Input() defaultPolicyId: number; // optional input: if not set then first policy in policies will be selected by default
  @Input() filteredPolicyIds: number[]; // optional input: if not set then all policies will show for rolePlayerId

  @Output() policySelectedEmit: EventEmitter<Policy> = new EventEmitter();
  @Output() policiesEmit: EventEmitter<Policy[]> = new EventEmitter();
  @Output() isReadyEmit: EventEmitter<boolean> = new EventEmitter(false);

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  policies: Policy[];
  selectedPolicy: Policy;

  products: Product[];

  cancelled = PolicyStatusEnum.Cancelled;
  funeral = ProductCategoryTypeEnum.Funeral;

  hasRunningWizards = false;

  disable_coid_vaps_e2e_clientcare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_ClientCare');

  constructor(
    private readonly policyService: PolicyService,
    private readonly productService: ProductService,
    private readonly authService: AuthService,
    public dialog: MatDialog,
    private readonly router: Router
  ) {
    super();
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.rolePlayerId) {
      this.isReadyEmit.emit(false);
      this.isLoading$.next(true);
      if (this.products && this.products.length > 0) {
        this.getRolePlayerPolicies();
      } else {
        this.getProducts();
      }
    }
  }

  getProducts() {
    this.productService.getProducts().subscribe(results => {
      this.products = results;
      this.getRolePlayerPolicies();
    });
  }

  getRolePlayerPolicies() {
    this.policyService.getPoliciesWithProductOptionByRolePlayer(this.rolePlayerId).subscribe(results => {
      this.policies = this.filteredPolicyIds && this.filteredPolicyIds.length > 0 ?
        results.filter(s => this.filteredPolicyIds.includes(s.policyId)) : results;

      this.policies.forEach(s => {
        s.productOption.product = this.getProductName(s.productOption.productId);
      });

      this.autoSelectPolicy();

      this.policiesEmit.emit(this.policies);
      this.isReadyEmit.emit(true);
      this.isLoading$.next(false);
    });
  }

  getProductName(productId: number): Product {
    const product = this.products.find(s => s.id === productId);
    return product;
  }

  selectedPolicyChanged(policy: Policy) {
    if (this.isReadOnly) { return; }
    this.selectedPolicy = policy;
    this.policySelectedEmit.emit(policy);
  }

  getPolicyStatus(policyStatus: PolicyStatusEnum): string {
    return this.formatText(PolicyStatusEnum[policyStatus]);
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  autoSelectPolicy() {
    if (this.isReadOnly) { return; }
    if (this.policies && this.policies.length > 0) {
      if (this.defaultPolicyId && this.defaultPolicyId > 0) {
        const index = this.policies.findIndex(s => s.policyId == this.defaultPolicyId);
        if (index > -1) {
          this.selectedPolicyChanged(this.policies[index]);
        } else {
          this.selectedPolicyChanged(this.policies[0]);
        }
      } else {
        this.selectedPolicyChanged(this.policies[0]);
      }
    }
  }

  openProformaStatementViewDialog(policy: Policy) {
    const parameters = [
      { key: 'policyIds', value: policy.policyId }
    ];

    const title = 'Statement: ' + policy.policyNumber;
    const reportUrl = 'RMA.Reports.FinCare/RMAStatement';
    const itemType = 'Statement';
    const itemId = policy.policyId;

    this.openDialog(title, reportUrl, parameters, itemType, itemId);
  }

  openTransactionalStatementViewDialog(policy: Policy) {
    const parameters = [
      { key: 'invoiceId', value: policy.policyId } // this is correct SQL param named incorrectly: invoiceId = policyId
    ];

    const title = 'Transactional Statement: ' + policy.policyNumber;
    const reportUrl = 'RMA.Reports.FinCare/RMATransactionalStatement';
    const itemType = 'Transactional Statement';
    const itemId = policy.policyId;

    this.openDialog(title, reportUrl, parameters, itemType, itemId);
  }

  openRemittanceViewDialog(policy: Policy) {
    const dialogRef = this.dialog.open(RemittanceReportDialogComponent, {
      width: '80%',
      disableClose: true,
      data: {
        title: `Remittance Report: ${policy.policyNumber} (${policy.productOption.code})`,
        report: { key: 'Remittance', value: 'RMA.Reports.FinCare/Remittance/RMARemittanceMemberV2Report' },
        parameters: [
          { key: 'PolicyId', value: policy.policyId.toString() },
        ]
      }
    });
  }

  openDialog(title: string, reportUrl: string, parameters: any, itemType: string, itemId: number) {
    const dialogRef = this.dialog.open(SsrsReportViewerDialogComponent, {
      width: '70%',
      disableClose: true,
      data: {
        title: title,
        reporturl: reportUrl,
        parameters: parameters,
        itemType: itemType,
        itemId: itemId,
        auditViewers: true // audit who views this document
      }
    });
  }

  setHasRunningWizards($event: boolean) {
    this.hasRunningWizards = $event;
  }

  navigateToParent($event: Policy) {
    this.router.navigate([`/clientcare/member-manager/holistic-role-player-view/${$event.policyPayeeId}/1/${$event.policyId}`]);
  }
}
