import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { RolePlayerPolicy } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy';
import { RolePlayerPolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/role-player-policy.service';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { BankAccountTypeEnum } from 'projects/shared-models-lib/src/lib/enums/bank-account-type-enum';
import { BehaviorSubject } from 'rxjs';
import { RefundReasonEnum } from '../../../shared/enum/refund-reason.enum';
import { RefundTypeEnum } from '../../../shared/enum/refund-type.enum';
import { DebtorSearchResult } from '../../../shared/models/debtor-search-result';
import { Refund } from '../../models/refund';
import { DocumentsComponent } from '../documents/documents.component';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';

@Component({
  selector: 'app-policy-reclassification-refund',
  templateUrl: './policy-reclassification-refund.component.html',
  styleUrls: ['./policy-reclassification-refund.component.css']
})
export class PolicyReclassificationRefundComponent implements OnInit, AfterViewInit {
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  panelOpenState$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isSubmitting$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  submitDisabled$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  currentQuery: string;
  rowCount: number;
  form: UntypedFormGroup;
  selectedPolicy: RolePlayerPolicy;
  policyId: number;
  rolePlayerId: number;
  selectedTabIndex = 0;
  policyNumber = '';
  rolePlayerName = '';
  debtorSearchResult: DebtorSearchResult;
  requestCode: string;
  transactiontypeText: string;
  refundWizardinProgress = false;
  wizardInProgressName = '';
  searchFailedMessage = '';
  backLink = '/fincare/billing-manager';
  rolePlayerBankingDetails: RolePlayerBankingDetail[];
  showOwnAmount: boolean;
  message: string;
  refundableAmount: number;
  lastSelectedPartialTranId: number;
  maxAmountAllowed: number;
  showMessage: boolean;
  ownAmount: number;
  hideButtons = false;
  isStatutoryProduct$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  documentSet = DocumentSetEnum.CoidPolicyRefund;


  displayedColumns = ['policyNumber', 'action'];
  datasource = new MatTableDataSource<RolePlayerPolicy>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  @ViewChild(DocumentsComponent, { static: false }) documentsComponent: DocumentsComponent;

  constructor(
    private readonly router: Router,
    private readonly wizardService: WizardService,
    private readonly rolePlayerService: RolePlayerService,
    private readonly toastr: ToastrManager,
    private readonly formbuilder: UntypedFormBuilder,
    private readonly policyService: RolePlayerPolicyService,
    private readonly productService: ProductService) { }

  ngAfterViewInit(): void {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  ngOnInit() {
    this.rolePlayerBankingDetails = new Array();
    this.createForm();
  }

  createForm() {
    this.form = this.formbuilder.group({
      amount: [null, [Validators.required]]
    });
  }

  getAccountType(accountTypeId: number): string {
    if (!accountTypeId || accountTypeId === 0) { return 'unknown'; }
    return (BankAccountTypeEnum[accountTypeId].replace(/([a-z])([A-Z])/g, '$1 $2'));
  }

  submitRefunds() {
    if (this.form.get('amount').valid) {
      this.isSubmitting$.next(true);
      const startWizardRequest = new StartWizardRequest();
      this.instantiateRefundWizard(startWizardRequest);
      this.createWizard(startWizardRequest);
    }
    else {
      this.message = 'Amount is required';
    }
  }

  createWizard(startWizardRequest: StartWizardRequest) {
    this.submitDisabled$ = new BehaviorSubject(true);
    this.wizardService.startWizard(startWizardRequest).subscribe(
      (result) => {
        this.toastr.successToastr('Refund task has created successfully.', '', true);
        this.submitDisabled$ = new BehaviorSubject(false);
        this.router.navigateByUrl(`fincare/billing-manager/refund/continue/${result.id}`);
      }
    );
  }

  instantiateRefundWizard(startWizardRequest: StartWizardRequest) {
    const refund = new Refund();
    startWizardRequest.type = 'refund';
    refund.trigger = RefundTypeEnum.PolicyReclassification;
    startWizardRequest.linkedItemId = this.rolePlayerId;
    refund.rolePlayerId = this.rolePlayerId;
    refund.rolePlayerName = this.debtorSearchResult.displayName;
    refund.refundAmount = this.form.get('amount').value;
    refund.refundReason = RefundReasonEnum.PolicyReclassification;
    refund.requestCode = this.requestCode;
    refund.finPayeNumber = this.debtorSearchResult.finPayeNumber;
    startWizardRequest.data = JSON.stringify(refund);
  }

  onAccountSelected(debtorSearchResult: DebtorSearchResult) {
    this.rolePlayerBankingDetails = new Array();
    this.panelOpenState$.next(false);
    this.debtorSearchResult = debtorSearchResult;
    this.rolePlayerId = debtorSearchResult.roleplayerId;
    this.rolePlayerName = debtorSearchResult.displayName;
    this.requestCode = debtorSearchResult.finPayeNumber;

    this.getRoleplayerPolicies();
    this.rolePlayerService.getBankingDetailsByRolePlayerId(this.rolePlayerId).subscribe(bankDetails => {
      this.rolePlayerBankingDetails = bankDetails;
    });
  }

  next() {
    this.selectedTabIndex += 1;
  }

  validateNoExistingWizardsExist() {
    this.wizardService.getWizardsInProgressByTypeAndLinkedItemId(this.rolePlayerId, 'refund')
      .subscribe(data => {
        if (data[0]) {
          if (data[0].id > 0) {
            this.refundWizardinProgress = true;
            this.wizardInProgressName = data[0].name;
          } else {
            this.refundWizardinProgress = false;
          }
        } else {
          this.refundWizardinProgress = false;
        }
      }
      );
  }

  back() {
    this.router.navigateByUrl(this.backLink);
  }


  getRoleplayerPolicies() {
    this.policyService.getPoliciesByPolicyPayeeIdNoRefData(this.rolePlayerId).subscribe(results => {
      if (results) {
        this.datasource.data = results;
        if (results.length === 1) {
          this.selectedPolicy = results[0];
          this.getPolicyDetails();
        }
      }
    });
  }
  onPolicySelected(item: RolePlayerPolicy) {
    this.selectedPolicy = item;
    this.getPolicyDetails();
  }

  getPolicyDetails() {
    this.policyService.getRolePlayerPolicyByNumber(this.selectedPolicy.policyNumber).subscribe(result => {
      if (result) {
        if (result.productOption.productId) {
          this.getProductDetails(result.productOption.productId);
        }
      }
    });
  }

  getProductDetails(productId: number) {
    this.productService.getProduct(productId).subscribe(result => {
      if (result.productClassId === 1) {
        this.isStatutoryProduct$.next(true);
      } else {
        this.isStatutoryProduct$.next(false);
      }
    });
  }
}
