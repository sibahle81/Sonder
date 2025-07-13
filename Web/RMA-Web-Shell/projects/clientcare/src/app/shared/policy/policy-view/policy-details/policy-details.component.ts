import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { PolicyCancelReasonEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-cancel-reason.enum';
import { PolicyItemTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-item-type.enum';
import { PolicyStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-status.enum';
import { ProductCategoryTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/product-category-type.enum';
import { ReinstateReasonEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/reinstate-reason.enum';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { PaymentFrequencyEnum } from 'projects/shared-models-lib/src/lib/enums/payment-frequency.enum';
import { PaymentMethodEnum } from 'projects/shared-models-lib/src/lib/enums/payment-method-enum';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { BehaviorSubject, Subscription } from 'rxjs';
import { RefreshService } from '../../../refresh-service/refresh-service';
import { InsurerEnum } from 'projects/shared-components-lib/src/lib/wizard/shared/models/insurer.enum';

@Component({
  selector: 'policy-details',
  templateUrl: './policy-details.component.html',
  styleUrls: ['./policy-details.component.css']
})
export class PolicyDetaisComponent extends PermissionHelper implements OnChanges, OnDestroy {

  @Input() policy: Policy;
  @Input() triggerRefresh: boolean;

  @Output() policySelected: EventEmitter<Policy> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  refreshSubscription: Subscription;

  auditPermission = 'View Audits';

  isCoid: boolean;
  isVaps: boolean;
  isFuneral: boolean;

  constructor(
    public dialog: MatDialog,
    private readonly policyService: PolicyService,
    private readonly refreshService: RefreshService
  ) {
    super();

    this.refreshSubscription = this.refreshService.getRefreshPolicyCommand().subscribe
      (refresh => {
        if (this.policy) {
          this.getPolicy();
        } else {
          this.isLoading$.next(false);
        }
      });
  }

  ngOnDestroy(): void {
    this.refreshSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.policy) {
      this.getPolicy();
    } else {
      this.isLoading$.next(false);
    }
  }

  getPolicy() {
    this.isLoading$.next(true);
    this.policyService.getPolicyWithProductOptionByPolicyId(this.policy.policyId).subscribe(result => {
      this.policy = result;
      this.setPolicyProductCategoryType();
      this.isLoading$.next(false);
    });
  }

  openAuditDialog(policy: Policy) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.PolicyManager,
        clientItemType: PolicyItemTypeEnum.Policy,
        itemId: policy.policyId,
        heading: 'Policy Details Audit',
        propertiesToDisplay: ['BrokerageId', 'ProductOptionId', 'RepresentativeId', 'JuristicRepresentativeId', 'PolicyOwnerId', 'PolicyPayeeId', 'PaymentFrequency', 'PaymentMethod',
          'PolicyNumber', 'PolicyInceptionDate', 'ExpiryDate', 'CancellationDate', 'FirstInstallmentDate', 'LastInstallmentDate', 'RegularInstallmentDayOfMonth', 'DecemberInstallmentDayOfMonth',
          'PolicyStatus', 'AnnualPremium', 'InstallmentPremium', 'CommissionPercentage', 'AdminPercentage', 'PolicyCancelReason', 'ClientReference', 'LastLapsedDate', 'LapsedCount', 'LastReinstateDate']
      }
    });
  }

  getPolicyStatus(policyStatus: PolicyStatusEnum): string {
    return this.formatText(PolicyStatusEnum[policyStatus]);
  }

  getPaymentFrequency(paymentFrequencyId: PaymentFrequencyEnum): string {
    return this.formatText(PaymentFrequencyEnum[paymentFrequencyId]);
  }

  getPaymentMethod(paymentMethodId: PaymentMethodEnum): string {
    return this.formatText(PaymentMethodEnum[paymentMethodId]);
  }

  getCancelReason(policyCancelReason: PolicyCancelReasonEnum): string {
    return this.formatText(PolicyCancelReasonEnum[policyCancelReason]);
  }

  getReinstateReason(reinstateReason: ReinstateReasonEnum): string {
    return this.formatText(ReinstateReasonEnum[reinstateReason]);
  }

  getInsurer(insurer: InsurerEnum): string {
    return this.formatText(InsurerEnum[insurer]);
  }

  formatText(text: string): string {
    if (!text) { return ''; }
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  setPolicyProductCategoryType() {
    if (this.policy.productCategoryType == ProductCategoryTypeEnum.Coid) {
      this.isCoid = true;
      this.isVaps = false;
      this.isFuneral = false;
      return;
    }

    if (this.policy.productCategoryType == ProductCategoryTypeEnum.VapsAssistance || this.policy.productCategoryType == ProductCategoryTypeEnum.VapsNoneStatutory) {
      this.isCoid = false;
      this.isVaps = true;
      this.isFuneral = false;
      return;
    }

    if (this.policy.productCategoryType == ProductCategoryTypeEnum.Funeral) {
      this.isCoid = false;
      this.isVaps = false;
      this.isFuneral = true;
      return;
    }

    if (this.policy.productCategoryType == ProductCategoryTypeEnum.None || !this.policy.productCategoryType) {
      this.isCoid = false;
      this.isVaps = false;
      this.isFuneral = false;
      return;
    }
  }
}
