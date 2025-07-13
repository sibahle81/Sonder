import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DeclarationService } from 'projects/clientcare/src/app/member-manager/services/declaration.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { TermArrangement } from '../../../models/term-arrangement';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrManager } from 'ng6-toastr-notifications';
import { RolePlayerPolicy } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy';
import { DebtorSearchResult } from 'projects/shared-components-lib/src/lib/models/debtor-search-result';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { TermArrangementStatusEnum } from 'projects/shared-models-lib/src/lib/enums/term-arrangement-status';
import { RolePlayerPolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/role-player-policy.service';
import { map, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { EarningsUptodateDialogComponent } from '../earnings-uptodate-dialog/earnings-uptodate-dialog.component';
import { ProductOptionService } from 'projects/clientcare/src/app/product-manager/services/product-option.service';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { ProductClassEnum } from 'projects/shared-models-lib/src/lib/enums/product-class-enum';
import { Product } from 'projects/clientcare/src/app/product-manager/models/product';
import { ProductOption } from 'projects/clientcare/src/app/product-manager/models/product-option';
import { TermArrangementService } from 'projects/fincare/src/app/shared/services/term-arrangement.service';
import { DebtorProductBalance } from 'projects/fincare/src/app/billing-manager/models/debtor-product-balance';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { PolicyProductCategory } from '../../../models/policy-product-category';
import { TermArrangementProductOption } from '../../../models/term-arrangement-productoption';
import { TermArrangementSubsidiary } from '../../../models/term-arrangement-subsidiary';
import { Wizard } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard';
import { ComplianceResult } from 'projects/clientcare/src/app/policy-manager/shared/entities/compliance-result';
import { TermSubsidiaryDialogComponent } from '../term-subsidiary-dialog/term-subsidiary-dialog.component';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { BillingService } from '../../../services/billing.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { ProductCategoryTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/product-category-type.enum';

@Component({
  selector: 'app-terms-arrangement-initiation',
  templateUrl: './terms-arrangement-initiation.component.html',
  styleUrls: ['./terms-arrangement-initiation.component.css']
})
export class TermsArrangementInitiationComponent implements OnInit, AfterViewInit {
  panelOpenState$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isSubmitting$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isSendingUnsuccessfulInitiationNotification$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  submitDisabled$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  currentQuery: string;
  rowCount: number;
  form: UntypedFormGroup;
  policyId: number;
  rolePlayerId = 0;
  selectedTabIndex = 0;
  policyNumber = '';
  rolePlayerName = '';
  debtorSearchResult: DebtorSearchResult;
  wizardInProgressName = '';
  termsWizardinProgress = false;
  searchFailedMessage = '';
  backLink = '/fincare/billing-manager';
  showOwnAmount: boolean;
  message: string;
  showMessage: boolean;
  hideButtons = false;
  checksFailed = true;
  selectedDebtor: DebtorSearchResult;
  roleplayerPolicies = [];
  selectedPolicyIds: number[] = [];
  selectedPolicies: PolicyProductCategory[] = []
  showSubmit = false;
  debtorPolicies: RolePlayerPolicy[] = [];
  isLoadingPolicies$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  finPayeNumber = '';
  industryClassName = '';
  isCheckingDeclarations$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  displayedColumns = ['productName', 'amount', 'compliance'];
  datasource = new MatTableDataSource<DebtorProductBalance>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  products: Product[];
  termsProductOptions: ProductOption[];
  declarationsUptoDate = false;
  initiationFailed = false;
  isAuthorized = false;
  hasCreateTermsInitiationPermission = false;
  hasZeroBalance = false;
  productsSearched = false;
  isLoadingProductBalances$ = new BehaviorSubject(false);
  wizard: Wizard;
  complianceResult: ComplianceResult;
  complianceValidationMessage: string = '';
  hasInvalidProducts = false;

  termArrangementProductOptions: TermArrangementProductOption[] = [];
  subsidiaries: TermArrangementSubsidiary[] = [];
  displayedColumnsProducts = ['finPayenumber', 'productName', 'amount', 'onActiveTerms','compliantStatus','actions'];
  datasourceProducts = new MatTableDataSource<TermArrangementProductOption>();
  panelOpenStatePolicies$ = new BehaviorSubject(true);
  activeTermArrangementProductOptions: TermArrangementProductOption[] = [];
  retrievingActiveTermArrangementProductOptions$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showProductOnActiveTermsError = false;

  constructor(
    private readonly router: Router,
    private readonly wizardService: WizardService,
    private readonly toastr: ToastrManager,
    private readonly formbuilder: UntypedFormBuilder,
    private readonly productService: ProductService,
    private readonly productOptionService: ProductOptionService,
    private readonly termArrangementService: TermArrangementService,
    public subsidiaryDialog: MatDialog,
    public dialog: MatDialog,
    private readonly billingService: BillingService,
    protected readonly confirmService: ConfirmationDialogsService,) { }

  ngOnInit(): void {
    this.hasCreateTermsInitiationPermission = userUtility.hasPermission('Initate Term Arrangement');
    this.isAuthorized = this.hasCreateTermsInitiationPermission;
    this.form = this.formbuilder.group({
    });
  }

  ngAfterViewInit(): void {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }


  toggleSubmit() {
    if (this.selectedPolicyIds.length > 0) {
      this.submitDisabled$.next(false);
    } else {
      this.submitDisabled$.next(true);
    }
  }

  createWizard(startWizardRequest: StartWizardRequest) {
    this.wizardService.startWizard(startWizardRequest).subscribe(wizard => {
      if (wizard) {
        this.wizard = wizard;
        this.toastr.successToastr('Terms capture task has created successfully.', '', true);
        this.router.navigateByUrl(`${this.backLink}/terms-arrangement/continue/${wizard.id}`);
      }
      else {
        this.back();
      }
    });
  }

  instantiateTermsWizard(startWizardRequest: StartWizardRequest, policyId: number) {
    const termArrangement = new TermArrangement();
    startWizardRequest.type = 'terms-arrangement';
    termArrangement.rolePlayerId = this.selectedDebtor.roleplayerId;
    termArrangement.termArrangementStatus = TermArrangementStatusEnum.ApplicationInProgress;
    termArrangement.policyId = policyId;
    termArrangement.memberNumber = this.selectedDebtor.finPayeNumber;
    termArrangement.memberName = this.selectedDebtor.displayName;
    termArrangement.isActive = true;

    const amount = +this.termArrangementProductOptions.reduce((a, b) => a + b.contractAmount, 0).toFixed(2);

    let termSubsidiaries: TermArrangementSubsidiary[] = [];
    const termSubsidiary = new TermArrangementSubsidiary();
    termSubsidiary.debtorName = this.selectedDebtor.displayName;
    termSubsidiary.finpayeeNumber = this.selectedDebtor.finPayeNumber;
    termSubsidiary.roleplayerId = this.selectedDebtor.roleplayerId;
    termSubsidiary.balance = amount;
    termArrangement.balance = amount;
    termArrangement.totalAmount = amount;
    termSubsidiaries.push(termSubsidiary);
    termArrangement.termArrangementSubsidiaries = [...termSubsidiaries.concat([...this.subsidiaries])];;
    termArrangement.termArrangementProductOptions = this.termArrangementProductOptions;

    startWizardRequest.linkedItemId = this.selectedDebtor.roleplayerId;
    startWizardRequest.data = JSON.stringify(termArrangement);
  }

  onAccountSelected(debtorSearchResult: DebtorSearchResult) {
    this.panelOpenState$.next(false);
    this.selectedDebtor = debtorSearchResult;
    this.rolePlayerId = debtorSearchResult.roleplayerId;
    this.rolePlayerName = debtorSearchResult.displayName;
    this.finPayeNumber = debtorSearchResult.finPayeNumber;
    this.industryClassName = debtorSearchResult.industryClass;
    this.termArrangementProductOptions=[];
    this.datasourceProducts.data  = [];
  }
  canShowSubmit() {
    if (this.selectedPolicyIds.length > 0) {
      this.showSubmit = true;
    } else {
      this.showSubmit = false;
    }
  }

  submit() {
    //Validate If RolePlayer Product Is On Active TermArrangement
    this.showProductOnActiveTermsError = false;
    this.datasourceProducts.data.forEach(termArrangementProductOption => {
      if(this.validateIfRolePlayerProductIsOnActiveTermArrangement(termArrangementProductOption.roleplayerId,termArrangementProductOption.productOptionId ))
      {
        this.showProductOnActiveTermsError = true;
        return;
      }
    });

    if(this.showProductOnActiveTermsError){ return; }

    //proceed to submit
    this.isSubmitting$.next(true);
    this.wizardService.getWizardsInProgressByTypeAndLinkedItemId(this.rolePlayerId, 'terms-arrangement')
      .subscribe(data => {
        if (data[0]) {
          if (data[0].id > 0) {
            this.termsWizardinProgress = true;
            this.wizardInProgressName = data[0].name;
            this.isSubmitting$.next(false);
          } else {
            this.termsWizardinProgress = false;
            const startWizardRequest = new StartWizardRequest();
            this.instantiateTermsWizard(startWizardRequest, this.rolePlayerId);
            this.createWizard(startWizardRequest);
          }
        } else {
          this.termsWizardinProgress = false;
          const startWizardRequest = new StartWizardRequest();
          this.instantiateTermsWizard(startWizardRequest, this.rolePlayerId);
          this.createWizard(startWizardRequest);
        }
      }
      );
  }

  back() {
    this.router.navigateByUrl(this.backLink);
  }

  goToTasks() {
    this.router.navigateByUrl(this.backLink);
  }

  getProductsForTerms() {
    const productClassIds = this.getEnumValues(ProductClassEnum).filter(pc => pc === +ProductClassEnum.Assistance || pc === +ProductClassEnum.Life).join(',');
    if (productClassIds.length > 0) {
      this.productService.getProductsExcludingCertainClasses(productClassIds).subscribe(data => {
        this.products = [...data];
        this.getProductOptionsForTerms(this.products);
      });
    }
  }

  getProductOptionsForTerms(products: Product[]) {
    const productClassIds = products.map(p => p.id).join(',');
    if (productClassIds.length > 0) {
      this.productOptionService.getProductOptionsByProductIds(productClassIds).subscribe(data => {
        this.termsProductOptions = [...data];
      });
    }
  }

  getEnumValues(enums: any): number[] {
    const results = [];
    const keys = Object.values(enums)
      .filter((v) => Number.isInteger(v));
    for (const key of keys) {
      if (key && enums[key as number]) {
        results.push(key);
      }
    }
    return results;
  }

  failInitiationDueToNonCompliance() {
    this.dialog.open(EarningsUptodateDialogComponent, {
      data: { earningsUptodate: false }
    });
    this.initiationFailed = true;
    this.declarationsUptoDate = false;
    this.termArrangementService.addUnsuccessfulInitiation(this.rolePlayerId).subscribe();
  }

  getProductTotals(): number {
    const total = this.datasourceProducts.data.reduce((a, b) => a + b.contractAmount, 0).toFixed(2);
    return +total;
  }

  sendUnsuccessfulInitiationNotificationDialog(item: TermArrangementProductOption)
  {
    this.confirmService.confirmWithoutContainer(' Unsuccessful Initiation Notification', ' Are you sure you want to send client notification ?', 'Center', 'Center', 'Yes', 'No').subscribe(
      result => {
        if (result === true) {
          this.isSendingUnsuccessfulInitiationNotification$.next(true);
          this.termArrangementService.addUnsuccessfulInitiation(item.roleplayerId).subscribe(
            res=>
            {
              if(res)
              {
                this.removeProductOption(item);
                this.isSendingUnsuccessfulInitiationNotification$.next(false);
              }
            }
          )
        }
      });
  }

  getActiveTermArrangementsProductOptionsByRolePlayerId(roleplayerId:number)
  {
    if(this.activeTermArrangementProductOptions.find(x=>x.roleplayerId === roleplayerId) == undefined)
    {
      this.retrievingActiveTermArrangementProductOptions$.next(true);
      this.termArrangementService.getActiveTermArrangementsProductOptionsByRolePlayerId(roleplayerId).subscribe(
        res=>
        {
          this.activeTermArrangementProductOptions.push(...res);
          this.retrievingActiveTermArrangementProductOptions$.next(false);
        }
      );
    }
  }

  validateIfRolePlayerProductIsOnActiveTermArrangement(roleplayerId: number, productOptionId: number): Boolean
  {
     return (this.activeTermArrangementProductOptions.find(x => x.roleplayerId === roleplayerId && x.productOptionId === productOptionId)) === undefined ? false : true;
  }

  policiesSelected($event: PolicyProductCategory[]) {
    this.getActiveTermArrangementsProductOptionsByRolePlayerId(this.rolePlayerId);
    this.selectedPolicyIds = [];
    this.selectedPolicies = [];
    this.selectedPolicies = $event;
    this.selectedPolicies.forEach(c => {
      this.selectedPolicyIds.push(c.policyId);

      let option = new TermArrangementProductOption();
      option.productOptionId = c.productOption.id;
      option.contractAmount = c.productBalance;
      option.productOptionName = c.productOption.code;
      option.roleplayerId = this.rolePlayerId;
      option.finPayenumber = this.selectedDebtor.finPayeNumber;
      option.policyId = c.policyId;

      if (this.termArrangementProductOptions
        .findIndex(d => d.productOptionId === c.productOption.id
          && d.roleplayerId === this.rolePlayerId) < 0) {
        this.termArrangementProductOptions.push(option);
      }
    });


    this.datasourceProducts.data = [...this.termArrangementProductOptions];
    this.validateProductBalances();
    this.validateProductSelection($event);
  }

  setProductComplianceResult($event: ComplianceResult, termArrangementProductOption: TermArrangementProductOption ) {
    let complianceResult = $event;
    termArrangementProductOption.complianceResult = complianceResult;
  }

  checkingComplianceDone()
  {
    if(!this.datasourceProducts?.data)
    {
      return true;
    }
    if(this.datasourceProducts?.data.length > 0)
    {
      let notLoadedYet =  this.datasourceProducts?.data.filter(x=>  x.complianceResult == undefined);
      return (notLoadedYet.length === 0)
    }
    return true;
  }

  checkCompliance(): boolean
  {
    if(!this.datasourceProducts?.data)
    {
      return false;
    }
    if(this.datasourceProducts?.data.length === 0)
    {
      return false;
    }
    let notLoadedYet =  this.datasourceProducts?.data.find(x=>  x.complianceResult == undefined);
    if(notLoadedYet)
    {
      return false;
    }
    let nonComplianyPolicy = this.datasourceProducts?.data.find(x=>x.complianceResult?.isApplicable == true && x.complianceResult?.isDeclarationCompliant == false)
    return nonComplianyPolicy == undefined ? true: false;
  }

  addSubsidiary() {
    this.panelOpenStatePolicies$.next(false);
    const dialogref = this.subsidiaryDialog.open(TermSubsidiaryDialogComponent, {
      width: '80%', height: 'auto'
    });
    dialogref.afterClosed().subscribe((data) => {
      if (data && data.debtor) {
        if (data.termArrangementProductOptions) {
          if (data.termArrangementProductOptions as TermArrangementProductOption[]) {
            this.termArrangementProductOptions.push(...data.termArrangementProductOptions);
          }
          if (data.activeTermArrangementProductOptions as TermArrangementProductOption[]) {
            if(data.activeTermArrangementProductOptions  && data.activeTermArrangementProductOptions.length > 0)
            {
              this.activeTermArrangementProductOptions= this.activeTermArrangementProductOptions.filter((ele, ind)=> ele.roleplayerId  != data.activeTermArrangementProductOptions[0].roleplayerId);
              this.activeTermArrangementProductOptions.push(...data.activeTermArrangementProductOptions);
            }
          }

          const options = [... this.datasourceProducts.data]
            .concat([...data.termArrangementProductOptions])
            .sort((a, b) => b.finPayenumber.localeCompare(a.finPayenumber));
          this.datasourceProducts.data = [...options];
        }
        const balance = +data.termArrangementProductOptions.reduce((a, b) => a + b.contractAmount, 0).toFixed(2);
        this.addSubsidiaryToDatasource(data.debtor.roleplayerId, data.debtor.displayName, data.debtor.finPayeNumber, balance);
      }
    });
  }

  addSubsidiaryToDatasource(roleplayerId: number, debtorName: string, finpayeeNumber: string, balance: number) {
    this.subsidiaries.push({ balance, finpayeeNumber, debtorName, roleplayerId });
  }

  removeProductOption(item: TermArrangementProductOption) {
    for (let i = 0; i < this.termArrangementProductOptions.length; i++) {
      if ((this.termArrangementProductOptions[i].roleplayerId === item.roleplayerId && this.termArrangementProductOptions[i].productOptionId === item.productOptionId)) {
        this.termArrangementProductOptions.splice(i, 1);
        break;
      }
    }
    const options = [... this.termArrangementProductOptions]
      .sort((a, b) => b.finPayenumber.localeCompare(a.finPayenumber));
    this.datasourceProducts.data = [...options];
    this.validateProductBalances();
  }

  validateProductBalances()
  {
    const total = this.datasourceProducts.data.reduce((a, b) => a + b.contractAmount, 0).toFixed(2);
    if ( Number.isNaN(+total) || (+total < 1) ) {
      this.productsSearched = true;
      this.hasZeroBalance = true;
      this.showSubmit = false;
    }
    else {
      this.hasZeroBalance = false;
      this.showSubmit = true;
    }
  }

  validateProductSelection(policies: PolicyProductCategory[])
  {
    let optionsThatAllowTerms : ProductOption[] = [];
    this.productOptionService.getProductOptionsThatAllowTermArrangements().pipe(
      tap(data =>{
        if(data){
          optionsThatAllowTerms = [...data];
          this.hasInvalidProducts = policies.map(c => c.productOption.id)
          .filter(x => !optionsThatAllowTerms
          .map(k => k.id)
          .includes(x)).length> 0;
        if(this.hasInvalidProducts){
          this.showSubmit = false;
        }
        else {
          this.showSubmit = true;
        }}
      })
    ).subscribe();
  }
}
