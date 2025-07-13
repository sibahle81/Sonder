import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TermArrangementService } from 'projects/fincare/src/app/shared/services/term-arrangement.service';
import { DebtorSearchResult } from 'projects/shared-components-lib/src/lib/models/debtor-search-result';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { TermArrangement } from '../../../models/term-arrangement';
import { TermArrangementSchedule } from '../../../models/term-arrangement-schedule';
import { MemoOfAgreementComponent } from '../memo-of-agreement/memo-of-agreement.component';
import { TermScheduleComponent } from '../term-schedule/term-schedule.component';
import { TermsArrangementNote } from '../../../models/term-arrangement-note';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { TermArrangementStatusEnum } from 'projects/shared-models-lib/src/lib/enums/term-arrangement-status';
import { SubjectSubscriber } from 'rxjs/internal/Subject';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { Wizard } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard';
import { TermArrangementProductOption } from '../../../models/term-arrangement-productoption';
import { ToastrManager } from 'ng6-toastr-notifications';
import { TermArrangementSubsidiary } from '../../../models/term-arrangement-subsidiary';
import { ProductOptionService } from 'projects/clientcare/src/app/product-manager/services/product-option.service';
import { ProductOption } from 'projects/clientcare/src/app/product-manager/models/product-option';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { TermArrangementReassessmentComponent } from '../term-arrangement-reassessment/term-arrangement-reassessment.component';
import { EditTermArrangementSchedules } from '../../../models/edit-term-arrangement-schedules';
import { TermArrangementAdhocPaymentInstructionsDialogComponent } from '../term-arrangement-adhoc-payment-instructions-dialog/term-arrangement-adhoc-payment-instructions-dialog.component';
import { CollectionsService } from '../../../services/collections.service';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';

@Component({
  selector: 'app-terms-arrangement-debtor-details',
  templateUrl: './terms-arrangement-debtor-details.component.html',
  styleUrls: ['./terms-arrangement-debtor-details.component.css']
})
export class TermsArrangementDebtorDetailsComponent implements OnInit, AfterViewInit {
  panelOpenState$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  submitDisabled$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  currentQuery: string;
  rowCount: number;
  form: UntypedFormGroup;
  rolePlayerId: number;
  selectedTabIndex = 0;
  policyNumber = '';
  rolePlayerName = '';
  debtorSearchResult: DebtorSearchResult;
  searchFailedMessage = '';
  errorMessage = '';
  backLink = '/fincare/billing-manager';
  showOwnAmount: boolean;
  message: string;
  showMessage: boolean;
  selectedDebtor: DebtorSearchResult;
  debtorTermArrangements: TermArrangement[] = [];
  isLoadingTermArrangements$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isUpdatingTermsArrangementSchedules$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  finPayeNumber = '';
  industryClassName = '';
  showSubmit = false;
  menus: { title: string, action: string, disable: boolean }[];
  ssrsBaseUrl: string;
  termschedule: TermArrangementSchedule[] = [];
  termArrangementId: number;
  termsArrangementNote: TermsArrangementNote[];
  termStatuses: { id: number, name: string }[];
  balance: number;
  year: number;
  termsWizardinProgress = false;
  wizardInProgressName = '';
  wizard: Wizard;
  roleplayerIndustryClass : IndustryClassEnum;

  displayedColumns = ['startDate', 'endDate', 'termMonths', 'totalAmount', 'balance', 'createdDate', 'termStatus', 'active', 'actions'];
  datasource = new MatTableDataSource<TermArrangement>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  termArrangementDocumentSet = DocumentSetEnum.TermsArrangementDocuments;
  docuemntsTabIndex = 2;
  moaTabIndex = 1;
  termArrangementSupportingDocumentSet = DocumentSetEnum.TermsSupportingDocuments;
  termProductOptions: ProductOption[];
  creatingReassessmentTask$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  checkingSignedMOADocument$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  termArrangementProductOptions: TermArrangementProductOption[] = [];
  constructor(
    private termArrangementService: TermArrangementService,
    private readonly router: Router,
    private readonly formbuilder: UntypedFormBuilder,
    public memoOfAgreementDialog: MatDialog,
    private readonly lookupService: LookupService,
    private readonly wizardService: WizardService,
    public dialog: MatDialog,
    private readonly toastr: ToastrManager,
    private readonly productOptionService: ProductOptionService,
    protected readonly confirmService: ConfirmationDialogsService,
    private readonly documentManagementService: DocumentManagementService,
    public termAgreementReAssessmentDialog: MatDialog,
    public termArrangementAdhocPaymentInstructionsDialog: MatDialog,
    private readonly collectionService: CollectionsService
  ) { }

  ngOnInit(): void {
    this.form = this.formbuilder.group({
    });
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe((value: any) => {
      this.ssrsBaseUrl = value;
    });

    this.menus =
      [
        { title: 'MOA', action: 'moa', disable: false },
        { title: 'Schedule', action: 'schedule', disable: false },
        { title: 'Documents', action: 'documents', disable: false },
        { title: 'View Adhoc Debit Orders', action: 'openTermArrangementAdhocPaymentInstructions', disable: false },
        { title: 'ReAssess Term Arrangement', action: 'reAssessTermArrangement', disable: false },
      ];

    this.termStatuses = this.ToKeyValuePair(TermArrangementStatusEnum);
  }

  ngAfterViewInit(): void {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  onAccountSelected(debtorSearchResult: DebtorSearchResult) {
    this.panelOpenState$.next(false);
    this.selectedDebtor = debtorSearchResult;
    this.rolePlayerId = debtorSearchResult.roleplayerId;
    this.rolePlayerName = debtorSearchResult.displayName;
    this.finPayeNumber = debtorSearchResult.finPayeNumber;
    this.industryClassName = debtorSearchResult.industryClass;
    this.roleplayerIndustryClass = IndustryClassEnum[IndustryClassEnum[debtorSearchResult.industryClassId]],
    this.getTermArrangement();
  }

  getMenus(item: TermArrangement)
  {
    if(item?.isActive)
    {
      return this.menus;
    }
    else
    {
      var menus=  this.menus.filter(x=>x.action != 'reAssessTermArrangement')
      return menus;
    }
  }

  getTermArrangement() {
    this.isLoadingTermArrangements$.next(true);
    this.termArrangementService.getTermArrangementsByRolePlayerId(this.rolePlayerId).pipe(map(data => {
      if (data) {
        this.datasource.data = [...data];
        this.isLoadingTermArrangements$.next(false);
      }
      else {
        this.isLoadingTermArrangements$.next(false);
      }
    })).subscribe();
  }

  back() {
    this.router.navigateByUrl(this.backLink);
  }

  GetStatus(statusId: number): string {
    let status = 'Unknown';
    if (this.termStatuses.filter(c => c.id == statusId)[0].name) {
      status = this.formatLookup(this.termStatuses.filter(c => c.id == statusId)[0].name)
    }
    return status;
  }

  onMenuItemClick(item: TermArrangement, menu: any): void {
    this.errorMessage= '';
    switch (menu.action) {
      case 'moa':
        this.onMOASelected(item);
        break;
      case 'schedule':
        this.openTermScheduleDialog(item);
        break;
      case 'documents':
        this.onDocumentsSelected(item);
        break;
      case 'reAssessTermArrangement':
        this.onReAssessTermArrangementSelected(item);
      break;
      case 'openTermArrangementAdhocPaymentInstructions':
        this.openTermArrangementAdhocPaymentInstructionsDialog(item);
      break;
    }
  }  

  openTermScheduleDialog(item: TermArrangement) {
    const dialogref = this.memoOfAgreementDialog.open(TermScheduleComponent, {
      width: '960px', height: '700px',
      data: {
        termschedule: item.termArrangementSchedules
      }
    });

    dialogref.afterClosed().subscribe((data) => {
      if (data && data?.termschedule) {
        this.isUpdatingTermsArrangementSchedules$.next(true);
        if(data.termschedule as TermArrangementSchedule[])
        {
          let editTermArrangementSchedules =new  EditTermArrangementSchedules(); 
          editTermArrangementSchedules.termArrangementSchedules = data.termschedule;
            this.termArrangementService.EditTermArrangementSechedulesCollectionFlags(editTermArrangementSchedules).subscribe(result=>
              {
                this.isUpdatingTermsArrangementSchedules$.next(false);
                this.back();
              });
        }
      }
    }
    );
  }

  openTermArrangementAdhocPaymentInstructionsDialog(item: TermArrangement)
  {
    this.collectionService.getAdhocPaymentInstructionsTermArrangementSchedules(item.termArrangementId).subscribe(
    results=>
    {
      if(results && results.length > 0)
      {
        const dialogref = this.termArrangementAdhocPaymentInstructionsDialog.open(TermArrangementAdhocPaymentInstructionsDialogComponent, {
          width: '870px', height: '620px',
          data: {
            termschedule: item.termArrangementSchedules,
            adhocPaymentInstructionsTermArrangementSchedules: results.sort( (a,b) => a.adhocPaymentInstructionsTermArrangementScheduleId- b.adhocPaymentInstructionsTermArrangementScheduleId )
          }
        });
      }
      else
      {
        this.errorMessage = 'adhoc debit orders not found';    
      }
    });
  }

  onDocumentsSelected(item: TermArrangement) {
    this.termArrangementId = item.termArrangementId;
    this.selectedTabIndex = this.docuemntsTabIndex;
  }

  onReAssessTermArrangementSelected(item: TermArrangement){
    this.termArrangementId = item.termArrangementId;

    const dialogref = this.termAgreementReAssessmentDialog.open(TermArrangementReassessmentComponent, {
      width: '80%', height: 'auto', data: {roleplayerId: this.rolePlayerId, finPayeNumber: this.finPayeNumber, rolePlayerName: this.rolePlayerName }
    });

    dialogref.afterClosed().subscribe((data) => {
      if (data && data.termArrangementProductOptions && data.termArrangementProductOptions.length> 0) {
        if (data.termArrangementProductOptions) {
          if (data.termArrangementProductOptions as TermArrangementProductOption[]) {
            this.termArrangementProductOptions.push(...data.termArrangementProductOptions);
          }
        }
        const balance = +data.termArrangementProductOptions.reduce((a, b) => a + b.contractAmount, 0).toFixed(2);
        this.checkSignedMOAandContinueToReAssess(item);
      }
      else
      {
        this.errorMessage = 'selected products not found';
      }
    });
  }

  checkSignedMOAandContinueToReAssess(item: TermArrangement)
  {
    this.confirmService.confirmWithoutContainer(' ReAssess Term Arrangement', ' Are you sure you want to re assess current term arrangement ?', 'Center', 'Center', 'Yes', 'No').subscribe(
      result => {
        if (result === true) {
          this.checkingSignedMOADocument$.next(true);
          this.documentManagementService.getDocumentsByKey('termArrangementId', item.termArrangementId.toString())
          .subscribe(termArrangementdocs=>
            {
              this.checkingSignedMOADocument$.next(false);
              var termArrangementSignedMoA = termArrangementdocs.find(x=>x.documentType === DocumentTypeEnum.SignedTermsMOA);           
              if(termArrangementSignedMoA === undefined ||termArrangementSignedMoA == null)
              {
                this.errorMessage = 'signed MOA document not found';
              }
              else
              {
                let selectedOptionIds: number[]=[];
                selectedOptionIds = this.termArrangementProductOptions.map(({ productOptionId }) => productOptionId)        
                this.productOptionService.getProductOptionsByIds(selectedOptionIds).subscribe(data=>
                  {
                    if (data.length > 0) {
                      this.termProductOptions = [...data];
                      this.completeReAssessTermArrangement();
                    } else {
                      this.errorMessage = 'product options not determined';
                    }
                  });
              }
            });
        }
      });
  }

  completeReAssessTermArrangement() {
    this.validateNoExistingWizardsExist();
  }

  validateNoExistingWizardsExist() {
    this.creatingReassessmentTask$.next(true);
    this.wizardService.getWizardsInProgressByTypeAndLinkedItemId(this.termArrangementId, 'terms-arrangement')
      .subscribe(data => {
        if (data[0]) {
          this.creatingReassessmentTask$.next(true);
          if (data[0].id > 0) {
            this.termsWizardinProgress = true;
            this.wizardInProgressName = data[0].name;
            this.creatingReassessmentTask$.next(false);
          } else {
            this.termsWizardinProgress = false;
            const startWizardRequest = new StartWizardRequest();

            this.instantiateTermsWizard(startWizardRequest, this.termArrangementId);
            this.createWizard(startWizardRequest);
          }
        } else {

          this.termsWizardinProgress = false;
          const startWizardRequest = new StartWizardRequest();
          this.instantiateTermsWizard(startWizardRequest, this.termArrangementId);
          this.createWizard(startWizardRequest);
        }
      }
      );
  }

  createWizard(startWizardRequest: StartWizardRequest) {
    this.wizardService.startWizard(startWizardRequest).subscribe(wizard => {
      if (wizard) {
        this.wizard = wizard;
        this.toastr.successToastr('Reassess Term Arrangement task has created successfully.', '', true);
        this.creatingReassessmentTask$.next(false);
        this.router.navigateByUrl(`${this.backLink}/terms-arrangement/continue/${wizard.id}`);
      }
    });
  }
  
  simpleClone(obj: any) {
    return Object.assign({}, obj);
}

  instantiateTermsWizard(startWizardRequest: StartWizardRequest, termArrangementId: number) {

    let existingTermArrangement = this.datasource.data.find(x=>x.termArrangementId == termArrangementId);

    const termArrangement = new TermArrangement();
    termArrangement.rolePlayerId = existingTermArrangement.rolePlayerId;
    termArrangement.termArrangementStatus = TermArrangementStatusEnum.ApplicationInProgress;
    termArrangement.policyId = existingTermArrangement.policyId;
    termArrangement.memberNumber = this.selectedDebtor.finPayeNumber;
    termArrangement.memberName = this.selectedDebtor.displayName;
    termArrangement.termArrangementStatus = TermArrangementStatusEnum.ApplicationInProgress;

    //recalculated amount due
    const amount = +this.termArrangementProductOptions.reduce((a, b) => a + b.contractAmount, 0).toFixed(2);

    //map termArrangementSubsidiaries
    let termSubsidiaries: TermArrangementSubsidiary[] = [];
    const termSubsidiary = new TermArrangementSubsidiary();
    termSubsidiary.debtorName = this.selectedDebtor.displayName;
    termSubsidiary.finpayeeNumber = this.selectedDebtor.finPayeNumber;
    termSubsidiary.roleplayerId = this.selectedDebtor.roleplayerId;
    termSubsidiary.balance = amount;
    termArrangement.balance = amount;
    termArrangement.totalAmount = amount;
    termSubsidiaries.push(termSubsidiary);
    termArrangement.termArrangementSubsidiaries = termSubsidiaries;
    termArrangement.termArrangementProductOptions = this.termArrangementProductOptions;

    //map termArrangementProductOptions
    termArrangement.termArrangementProductOptions = this.termArrangementProductOptions;
    //reset  termFlexibleSchedules
    termArrangement.termFlexibleSchedules = [];
    //reset  notes
    termArrangement.termsArrangementNotes = [];
    //reset  termArrangementSchedules
    termArrangement.termArrangementSchedules =  [];

    //map  additional fields from existing term arrangemnent - defaults for new term arrangemnent
    termArrangement.startDate = existingTermArrangement.startDate;
    termArrangement.endDate = existingTermArrangement.endDate;
    termArrangement.isDeleted = false;;
    termArrangement.notificationDate = existingTermArrangement.notificationDate;
    termArrangement.termMonths = existingTermArrangement.termMonths;
    termArrangement.installmentDay = existingTermArrangement.installmentDay;
    termArrangement.sendAgreementToClient = existingTermArrangement.sendAgreementToClient;
    termArrangement.termArrangementPaymentFrequency = existingTermArrangement.termArrangementPaymentFrequency;
    termArrangement.rolePlayerBankingId = existingTermArrangement.rolePlayerBankingId;
    termArrangement.isActive = true;
    termArrangement.paymentMethod = existingTermArrangement.paymentMethod;
    //link original term arrangement
    termArrangement.linkedTermArrangementId = termArrangementId;

    startWizardRequest.type = 'terms-arrangement';
    //link wizard to old term arrangement
    startWizardRequest.linkedItemId = termArrangementId; 
    startWizardRequest.data = JSON.stringify(termArrangement);
  }

  getActiveStatus(status: boolean): string {
    if (status) {
      return 'True';
    }
    return 'False';
  }

  onMOASelected(item: TermArrangement) {
    this.ssrsBaseUrl = this.ssrsBaseUrl
    this.termArrangementService.termArrangementDetails$.next({ termArrangementId: item.termArrangementId, balance: item.balanceCarriedToNextCycle, year: new Date(item.endDate).getFullYear(), reportServerAudit: this.ssrsBaseUrl,bankaccountId: item.bankaccountId });
    this.selectedTabIndex = this.moaTabIndex;
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  ToKeyValuePair(enums: any) {
    const results = [];
    const keys = Object.values(enums)
      .filter((v) => Number.isInteger(v));
    for (const key of keys) {
      if (key && enums[key as number]) {
        results.push({ id: key, name: enums[key as number] });
      }
    }
    return results;
  }
}
