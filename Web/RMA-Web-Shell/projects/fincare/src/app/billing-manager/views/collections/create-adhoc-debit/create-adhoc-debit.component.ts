import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { RolePlayerPolicy } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy';
import { BehaviorSubject} from 'rxjs';
import { DebtorSearchResult } from 'projects/shared-components-lib/src/lib/models/debtor-search-result';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { AdhocPaymentInstruction } from '../../../models/adhoc-payment-instruction';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BankAccountTypeEnum } from 'projects/shared-models-lib/src/lib/enums/bank-account-type-enum';
import { CollectionsService } from '../../../services/collections.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Router } from '@angular/router';
import { TermArrangementSchedule } from '../../../models/term-arrangement-schedule';
import { TermArrangementScheduleStatusEnum } from 'projects/shared-models-lib/src/lib/enums/term-arrangement-schedule-status';
import { da } from 'date-fns/locale';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { TermArrangementService } from 'projects/fincare/src/app/shared/services/term-arrangement.service';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { Guid } from 'guid-typescript';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { PolicyProductCategory } from '../../../models/policy-product-category';
@Component({
  selector: 'app-create-adhoc-debit',
  templateUrl: './create-adhoc-debit.component.html',
  styleUrls: ['./create-adhoc-debit.component.css']
})
export class CreateAdhocDebitComponent implements OnInit {
  selectedPolicies: PolicyProductCategory[] = [];
  panelOpenState$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isSubmitting$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  submitDisabled$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  currentQuery: string;
  rowCount: number;
  form: UntypedFormGroup;
  policyId: number;
  roleplayerId: number;
  selectedTabIndex = 0;
  policyNumber = '';
  rolePlayerName = '';
  rolePlayer:  RolePlayer;
  debtorSearchResult: DebtorSearchResult;
  selectedDebtor: DebtorSearchResult;
  hasCreateAdnocDebitPermission = false;
  isAuthorized = false;
  finPayeNumber: string;
  minDate: Date;
  industryClass: string;
  hasNoActiveBankingDetails = true;
  isLoadingTermArrangmentBankingDetails$ = new BehaviorSubject(false);
  isLoadingRolePlayer$ = new BehaviorSubject(false);
  selectedBankingDetails: RolePlayerBankingDetail;
  targetedTermArrangementScheduleIds : number[] = [];
  termArrangementScheduleStatus: TermArrangementScheduleStatusEnum = TermArrangementScheduleStatusEnum.Pending;
  overrideTermArrangementSchedules = false;
  selectedTermArrangementSchedules: TermArrangementSchedule[]
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  displayedColumns = ['bankName', 'bankAccountNumber', 'bankAccountHolder', 'bankAccountType', 'actions'];
  searchFailedMessage = '';
  errorMessage='';
  infoMessage='';
  preSelectRolePlayerBankingId =0;
  bankAccountsReadOnly = false;
  documentSystemName = DocumentSystemNameEnum.BillingManager;
  adohcDebitOrderDocumentsDocSet = DocumentSetEnum.AdohcDebitOrderDocuments;
  adhocPaymentInstructionId = 0;
  tempDocumentKeyValue: string;
  requiredDocumentsUploaded = false;
  expiryDate: Date;

  constructor(private readonly formbuilder: UntypedFormBuilder,
    private readonly rolePlayerService: RolePlayerService, private readonly collectionsService: CollectionsService, 
    private readonly termArrangementService : TermArrangementService,
    private readonly toastr: ToastrManager, 
    private readonly  router :Router,
    private readonly documentService: DocumentManagementService) { }
    
  ngOnInit(): void {
    this.tempDocumentKeyValue = Guid.create().toString();
    this.getExpiryDate();
    this.hasCreateAdnocDebitPermission = userUtility.hasPermission('Create Adhoc Debit Order');
    this.minDate = new Date();
    this.isAuthorized = this.hasCreateAdnocDebitPermission;
    this.form = this.formbuilder.group({
      amount: [null, Validators.required],
      debitDate: [Validators.required]
    });
  }

  onAccountSelected(debtorSearchResult: DebtorSearchResult) {
    this.panelOpenState$.next(false);
    this.errorMessage= "";
    this.infoMessage= "";
    this.selectedDebtor = debtorSearchResult;
    this.roleplayerId = debtorSearchResult.roleplayerId;
    this.rolePlayerName = debtorSearchResult.displayName;
    this.finPayeNumber = debtorSearchResult.finPayeNumber;
    this.industryClass = debtorSearchResult.industryClass;
   this.getRolePlayer(debtorSearchResult.roleplayerId);
  }

  getRolePlayer(rolePlayerId: number)
  {
    this.isLoadingRolePlayer$.next(true);
    this.rolePlayer = undefined;
    this.rolePlayerService.getRolePlayer(rolePlayerId).subscribe(result=>
      {
        this.rolePlayer = result;
        this.isLoadingRolePlayer$.next(false);
      });
  }

  retrieveTermArrangementBankingDetails(){ 
    this.errorMessage = "";
    this.infoMessage = "";
    if(this.targetedTermArrangementScheduleIds.length > 0)
    {
      this.isLoadingTermArrangmentBankingDetails$.next(true);
       this.termArrangementService.getTermsDebitOrderDetailsByTermArrangementId(this.selectedTermArrangementSchedules[0].termArrangementId).subscribe(result=>
        {
          if(result)
          {
            this.preSelectRolePlayerBankingId = result.rolePlayerBankingId;
            this.isLoadingTermArrangmentBankingDetails$.next(false);
            this.infoMessage = "Terms Agreement Bankng details were retrieved and pre selected on list";
          }
          else
          {
            this.errorMessage = "banking details not found for selected term arrangement schedules";
          }
          this.isLoadingTermArrangmentBankingDetails$.next(false);
        }); 
    }
  }

  getExpiryDate()
  {
    var date = new Date();
    date.setDate(date.getDate() + 1);
     this.expiryDate = date;
  }

  isRequiredDocumentsUploaded($event) {
    this.requiredDocumentsUploaded = $event;
  }
  
  policiesSelected(policies:PolicyProductCategory[]) {
    this.selectedPolicies = [...policies];
  }

  handleSelectedTermSchedules(selectedTermArrangementSchedules: TermArrangementSchedule[])
  {
    this.selectedTermArrangementSchedules = selectedTermArrangementSchedules;
    this.targetedTermArrangementScheduleIds = selectedTermArrangementSchedules.map(x=>x.termArrangementScheduleId);   
  }

  onSelectOverrideTermArrangementSchedules($event)
  {
    this.errorMessage = "";
    this.infoMessage = "";
    if($event.checked)
    {
      this.overrideTermArrangementSchedules = true;
    }
    else
    {
      this.overrideTermArrangementSchedules = false;
    }
  }

  submitDebitOrder() {
    if (!this.form.valid || !this.selectedBankingDetails) { return; }

    this.isSubmitting$.next(true);
    //validate if selected term arrangements schedules are queued for collections
    let termArrangmentValidationpromises = [];
    this.targetedTermArrangementScheduleIds.forEach(id => {
      const  collection = this.collectionsService.getCollectionByTermArrangementSchedule(id).toPromise();
      termArrangmentValidationpromises.push(collection);
    });

    Promise.all(termArrangmentValidationpromises).then(collections=>{
      
        let collection = collections.find(x=> x != null )
        if(collection)
        {
          this.errorMessage = "One of the selected term arrangement schedules is already queued for Collection";
          this.isSubmitting$.next(false);
        }
        else
        { //submit if valdations passed

             //validate if debit order mandate document was uploaded 
              if(this.isRequiredDocumentsUploaded)
              {
                //createAdhocDebit 
                this.collectionsService.createAdhocDebit(this.readDebitOrderForm()).subscribe(
                  result=>{ 
                    this.adhocPaymentInstructionId = result;
                    if(result > 0)
                    {
                      this.isSubmitting$.next(false); 
                      this.toastr.successToastr('Adhoc Debit Order Successfully Created');
                      this.router.navigate(['fincare/billing-manager/']);
                    }
                    else
                    {
                      this.isSubmitting$.next(false); 
                      this.toastr.errorToastr('Error updating adhoc debit order mandate document');
                    }

                  },
                  (error)=>{this.toastr.errorToastr(error.message); this.isSubmitting$.next(false);} );
              }
              else
              {
                this.isSubmitting$.next(false); 
                this.toastr.errorToastr('adhoc debit order mandate documents not found');
              }

        }
     });
  }

  readDebitOrderForm(): AdhocPaymentInstruction {
    const value = this.form.value;
    const debitOrder = new AdhocPaymentInstruction();
    debitOrder.adhocPaymentInstructionId = 0;
    const dateToPay = new Date(value.debitDate);
    dateToPay.setHours(0, 0, 0, 0);
    debitOrder.rolePlayerId = this.roleplayerId;
    debitOrder.rolePlayerName = this.rolePlayerName;
    debitOrder.finPayeNumber = this.finPayeNumber;
    debitOrder.dateToPay = dateToPay;
    debitOrder.amount = value.amount;
    debitOrder.adhocPaymentInstructionStatus = 1;
    if(this.selectedPolicies && this.selectedPolicies.length> 0){
      debitOrder.policyId = this.selectedPolicies[0].policyId;
      debitOrder.policyNumber = this.selectedPolicies[0].policyNumber;
    }
  
    debitOrder.rolePlayerBankingId = this.selectedBankingDetails.rolePlayerBankingId;
    debitOrder.tempDocumentKeyValue =this.tempDocumentKeyValue;

    if(this.overrideTermArrangementSchedules)
    {
      debitOrder.targetedTermArrangementScheduleIds =  this.targetedTermArrangementScheduleIds.sort();
    }
    return debitOrder;
  }

  setBankAccount(item: RolePlayerBankingDetail) {
    this.selectedBankingDetails = item;
  }

  getAcccountTypeDescription(type: number) {
    return this.splitPascalCaseWord(BankAccountTypeEnum[type]);
  }

  splitPascalCaseWord(word: string): string {
    const regex = /($[a-z])|[A-Z][^A-Z]+/g;
    return word.match(regex).join(' ');
  }
}
