import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UntypedFormGroup } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { SelectClaimBenefitComponent } from './select-claim-benefit/select-claim-benefit.component';
import { ClaimInvoiceService } from '../../../../services/claim-invoice.service';
import { ClaimEstimate } from '../../../entities/personEvent/claimEstimate';
import { ClaimEarningService } from '../../../../Services/claim-earning.service';
import { Earning } from '../../../entities/earning-model';
import { Benefit } from 'projects/clientcare/src/app/product-manager/models/benefit';
import { EventModel } from '../../../entities/personEvent/event.model';
import { Claim } from '../../../entities/funeral/claim.model';
import { ClaimEstimatesMoreInfoComponent } from './claim-estimates-more-info/claim-estimates-more-info.component';
import { EstimateTypeEnum } from 'projects/shared-models-lib/src/lib/enums/estimate-type-enum';
import { RefreshService } from '../../../refresh-service/refresh-service';
import { EstimatedOverrideDialogComponent } from './estimated-override-dialog/estimated-override-dialog.component';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { ClaimItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-type-enum';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { ProductCategoryTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/product-category-type.enum';
import { ClaimInvoiceCaptureDialogComponent } from './claim-invoice-capture-dialog/claim-invoice-capture-dialog.component';
import { PoolWorkFlowItemTypeEnum } from '../../../enums/pool-work-flow-item-type.enum';
import { PoolWorkFlow } from 'projects/shared-models-lib/src/lib/common/pool-work-flow';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { PoolWorkFlowService } from 'projects/shared-services-lib/src/lib/services/pool-work-flow/pool-work-flow.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ClaimLiabilityStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-liability-status.enum';
import { CommonNote } from 'projects/shared-models-lib/src/lib/common/common-note';
import { NoteCategoryEnum } from 'projects/shared-models-lib/src/lib/enums/note-category-enum';
import { NoteItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-item-type-enum';
import { NoteTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-type-enum';
import { CommonNoteModule } from 'projects/shared-models-lib/src/lib/common/common-note-module';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { CommonNotesService } from 'projects/shared-services-lib/src/lib/services/common-notes.service';
import { EstimatedManualCaptureDialogComponent } from './estimated-manual-capture-dialog/estimated-manual-capture-dialog.component';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';

@Component({
  selector: 'holistic-claim-estimates',
  templateUrl: './holistic-claim-estimates.component.html',
  styleUrls: ['./holistic-claim-estimates.component.css'],
})
export class HolisticClaimEstimatesComponent extends UnSubscribe implements OnChanges {

  canVerify = 'Verify PD Percentage';

  @Input() event: EventModel;
  @Input() personEvent: PersonEventModel;
  @Input() claim: Claim;
  @Input() isWizard = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  refreshSubscription: Subscription;

  form: UntypedFormGroup;
  dataSource: ClaimEstimate[];
  earnings: Earning[];

  menus: { title: string; url: string; disable: boolean }[];

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  benefits: Benefit[];
  isPolicyClaimProductCategoryTypeVaps = false;

  currentUser: User;

  supportedLiabilityStatuses = [ClaimLiabilityStatusEnum.MedicalLiability, ClaimLiabilityStatusEnum.Accepted, ClaimLiabilityStatusEnum.FullLiabilityAccepted];

  supportedOverrideEarningTypes = [EstimateTypeEnum.PDLumpSum, EstimateTypeEnum.PDPension, EstimateTypeEnum.TTD, EstimateTypeEnum.ShiftLoss, EstimateTypeEnum.TPD, EstimateTypeEnum.Sectn56];
  supportedManualOverrideEarningTypes = [EstimateTypeEnum.Sectn56];
  supportedCaptureInvoiceEarningTypes = [EstimateTypeEnum.Sectn56];

  constructor(
    private readonly claimInvoiceService: ClaimInvoiceService,
    private readonly policyService: PolicyService,
    protected claimEarningService: ClaimEarningService,
    public dialog: MatDialog,
    private readonly refreshService: RefreshService,
    private readonly commonNotesService: CommonNotesService,
    private readonly poolWorkFlowService: PoolWorkFlowService,
    private readonly authService: AuthService,
    private readonly alertService: ToastrManager
  ) {
    super();
    this.currentUser = this.authService.getCurrentUser();
    this.refreshSubscription = this.refreshService.getRefreshCommand().subscribe(refresh => {
      this.refresh();
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.event && this.personEvent && this.claim) {
      if (this.claim.policyId) {
        this.getPolicyProductCategoryType(this.claim.policyId);
      }
    }
  }

  getClaimEstimateByPersonEventId(personEventId: number) {
    this.isLoading$.next(true);
    this.claimInvoiceService.GetClaimEstimateByPersonEvent(personEventId).subscribe((results) => {
      if (results?.length > 0) {
        this.dataSource = results.filter(result => result.claimId === null || result.claimId === this.claim.claimId);
      } else {
        this.dataSource = [];
      }
      this.isLoading$.next(false);
    });
  }

  getPolicyProductCategoryType(policyId: number) {
    this.isLoading$.next(true);
    this.policyService.getPolicy(policyId).subscribe((result) => {
      if (result?.productCategoryType == ProductCategoryTypeEnum.VapsAssistance) {
        this.isPolicyClaimProductCategoryTypeVaps = true;
      }
      this.getClaimEstimateByPersonEventId(this.personEvent.personEventId);
    });
  }

  openSelectBenefitDialog() {
    const dialogRef = this.dialog.open(SelectClaimBenefitComponent, {
      width: '60%',
      maxHeight: '700px',
      disableClose: true,
      data: {
        personEvent: this.personEvent,
        claim: this.claim
      },
    });

    dialogRef.afterClosed().subscribe((benefits: Benefit[]) => {
      if (benefits) {
        this.addEstimates(benefits);
      }
    });
  }

  openManualCaptureDialog(claimEstimate: ClaimEstimate, documentSystemName: DocumentSystemNameEnum, documentSet: DocumentSetEnum, forceRequiredDocumentTypeFilter: DocumentTypeEnum[]) {
    const dialogRef = this.dialog.open(EstimatedManualCaptureDialogComponent, {
      width: '40%',
      maxHeight: '700px',
      disableClose: true,
      data: {
        claimEstimate: claimEstimate,
        // optional: if you want to force documents to be uploaded as proof of value captured
        documentSystemName: documentSystemName,
        documentSet: documentSet,
        forceRequiredDocumentTypeFilter: forceRequiredDocumentTypeFilter,
        personEventId: this.personEvent.personEventId
      },
    });

    dialogRef.afterClosed().subscribe((claimEstimate: ClaimEstimate) => {
      if (claimEstimate) {
        const index = this.dataSource.findIndex(s => s.claimEstimateId == claimEstimate.claimEstimateId);
        if (index >= -1) {
          this.dataSource[index] = claimEstimate;
        }
      }
    });
  }

  addEstimates(benefits: Benefit[]) {
    this.isLoading$.next(true);
    this.claimInvoiceService.addClaimEstimates(benefits, this.personEvent.personEventId).subscribe(result => {
      if (result) {
        this.refresh();
      }
    });
  }

  edit() {
    const dialogRef = this.dialog.open(EstimatedOverrideDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        claimEstimates: this.dataSource,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isLoading$.next(true);

        const claimEstimates = result.claimEstimates;
        const note = result.note;

        this.claimInvoiceService.recalculateClaimEstimates(claimEstimates).subscribe(results => {
          this.dataSource = results;
          this.addNote(note);

          const pd = claimEstimates.find(s => s.estimatePd);

          if(this.claim.pdVerified) 
          {
            if (pd?.estimatePd <= 10) {
              this.routeToWorkPool(WorkPoolEnum.CcaPool, note, false);
            } else if (pd?.estimatePd > 10) {
              if (!this.personEvent.assignedToUserId || this.personEvent.assignedToUserId <= 0) {
                this.routeToWorkPool(WorkPoolEnum.ScaPool, note, false);
              } else {
                this.routeToWorkPoolUser(WorkPoolEnum.ScaPool, note, this.personEvent.assignedToUserId, false);
              }
            }
          }
        });
      }
    });
  }

  addNote(message: string) {
    const commonSystemNote = new CommonNote();
    commonSystemNote.itemId = this.personEvent.personEventId;
    commonSystemNote.noteCategory = NoteCategoryEnum.PersonEvent;
    commonSystemNote.noteItemType = NoteItemTypeEnum.PersonEvent;
    commonSystemNote.noteType = NoteTypeEnum.SystemAdded;
    commonSystemNote.text = message;
    commonSystemNote.isActive = true;

    commonSystemNote.noteModules = [];
    const moduleType = new CommonNoteModule();
    moduleType.moduleType = ModuleTypeEnum.ClaimCare;
    commonSystemNote.noteModules.push(moduleType);

    this.commonNotesService.addNote(commonSystemNote).subscribe(_ => {
      this.isLoading$.next(false);
    });
  }

  routeToWorkPoolUser(workPool: WorkPoolEnum, instruction: string, userId: number, closeWorkPool: boolean) {
    const poolWorkFlow = new PoolWorkFlow();

    poolWorkFlow.poolWorkFlowItemType = PoolWorkFlowItemTypeEnum.PersonEvent;
    poolWorkFlow.itemId = this.personEvent.personEventId;
    poolWorkFlow.workPool = workPool;
    poolWorkFlow.assignedByUserId = this.currentUser.id;
    poolWorkFlow.assignedToUserId = userId;
    poolWorkFlow.effectiveFrom = new Date().getCorrectUCTDate();
    poolWorkFlow.instruction = instruction;

    if (closeWorkPool) {
      poolWorkFlow.effectiveTo = new Date().getCorrectUCTDate();
    } else {
      poolWorkFlow.effectiveTo = null;
    }

    this.poolWorkFlowService.handlePoolWorkFlow(poolWorkFlow).subscribe(_ => {
      this.alertService.successToastr(`routed to ${WorkPoolEnum[workPool]} workpool...`);
    });
  }

  routeToWorkPool(workPool: WorkPoolEnum, instruction: string, closeWorkPool: boolean) {
    const poolWorkFlow = new PoolWorkFlow();

    poolWorkFlow.poolWorkFlowItemType = PoolWorkFlowItemTypeEnum.PersonEvent;
    poolWorkFlow.itemId = this.personEvent.personEventId;
    poolWorkFlow.workPool = workPool;
    poolWorkFlow.assignedByUserId = this.currentUser.id;
    poolWorkFlow.assignedToUserId = null;
    poolWorkFlow.effectiveFrom = new Date().getCorrectUCTDate();
    poolWorkFlow.instruction = instruction;

    if (closeWorkPool) {
      poolWorkFlow.effectiveTo = new Date().getCorrectUCTDate();
    } else {
      poolWorkFlow.effectiveTo = null;
    }

    this.poolWorkFlowService.handlePoolWorkFlow(poolWorkFlow).subscribe(_ => {
      this.alertService.successToastr(`routed to ${WorkPoolEnum[workPool]} workpool...`);
    });
  }

  onMenuSelect(item: ClaimEstimate, menu: any) {
    switch (menu.title) {
      case 'More Info':
        this.openCoidWorkPoolMoreInforPopup(item);
        break;
      case 'Override':
        if (this.supportedManualOverrideEarningTypes.includes(item.estimateType)) {
          if (item.estimateType == EstimateTypeEnum.Sectn56) {
            this.openManualCaptureDialog(item, DocumentSystemNameEnum.ClaimManager, DocumentSetEnum.Section56, [DocumentTypeEnum.Section56SignoffLetter, DocumentTypeEnum.Section56RecommendationReport]);
          } else {
            this.openManualCaptureDialog(item, null, null, null);
          }
        } else {
          this.edit();
        }
        break;
      case 'Capture Invoice':
        this.openClaimInvoiceCapturePopup(item);
        break;
    }
  }

  getDisplayedColumns() {
    const columnDefinitions = [
      { def: 'estimateType', show: true },
      { def: 'estDays', show: true },
      { def: 'estPd', show: true },
      { def: 'estAmount', show: true },
      { def: 'allocaAmount', show: true },
      { def: 'authAmount', show: true },
      { def: 'oustandingDaysOff', show: true },
      { def: 'actions', show: this.currentUser?.isInternalUser }
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  openCoidWorkPoolMoreInforPopup(item: ClaimEstimate) {
    const def: any[] = [];
    const dialogRef = this.dialog.open(ClaimEstimatesMoreInfoComponent, {
      width: '50%',
      maxHeight: '750px',
      data: {
        personEvent: this.personEvent,
        claimEstimate: item
      }
    });
  }

  openClaimInvoiceCapturePopup(item: ClaimEstimate) {
    const def: any[] = [];
    const dialogRef = this.dialog.open(ClaimInvoiceCaptureDialogComponent, {
      width: '70%',
      maxHeight: '750px',
      disableClose: true,
      data: {
        personEvent: this.personEvent,
        claim: this.claim,
        claimEstimate: item,
      }
    });

    dialogRef.afterClosed().subscribe(triggerRefresh => {
      if (triggerRefresh) {
        this.refresh();
      }
    });
  }

  filterMenu(item: ClaimEstimate) {
    this.menus = [];
    this.menus = [
      { title: 'More Info', url: '', disable: false },
      { title: 'Override', url: '', disable: !(this.supportedOverrideEarningTypes.includes(item.estimateType)) },
      { title: 'Capture Invoice', url: '', disable: !(this.supportedCaptureInvoiceEarningTypes.includes(item.estimateType)) }
    ];
  }

  refresh() {
    this.getClaimEstimateByPersonEventId(this.personEvent.personEventId)
  }

  formatMoney(value: string): string {
    return value && value.length > 0 ? value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") : '-';
  }

  getEstimateType(id: number) {
    return this.formatText(EstimateTypeEnum[id]);
  }

  formatText(text: string): string {
    return text && text.length > 0 ? text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim() : '-';
  }

  calculateEstimatedAmount(): string {
    return this.formatMoney((this.dataSource?.reduce((est, total) => est + total.estimatedValue, 0))?.toFixed(2));
  }

  calculateAllocatedAmount(): string {
    return this.formatMoney((this.dataSource?.reduce((est, total) => est + total.allocatedValue, 0))?.toFixed(2));
  }

  formatEstimatePd(item: ClaimEstimate): string {
    if (item.estimateType === EstimateTypeEnum.PDLumpSum) {
      return `${item.estimatePd}%`;
    }
    return item.estimatePd > 0 ? item.estimatePd + '%' : '-';
  }

  calculateAuthorisedAmount(): string {
    return this.formatMoney((this.dataSource?.reduce((est, total) => est + total.authorisedValue, 0))?.toFixed(2));
  }

  openAuditDialog($event: ClaimEstimate) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.ClaimManager,
        clientItemType: ClaimItemTypeEnum.ClaimEstimate,
        itemId: $event.claimEstimateId,
        heading: `Estimate Audit`,
        propertiesToDisplay: ['EstimatedExtent', 'EstimatedValue', 'EstimatedDaysOff', 'AllocatedExtent', 'AllocatedValue', 'AllocatedDaysOff',
          'AuthorisedExtent', 'AuthorisedValue', 'AuthorisedDaysOff', 'SettledExtent', 'SettledValue', 'SettledDaysOff', 'IsOverrideExtent',
          'IsOverrideValue', 'IsOverrideDaysOff', 'IsFinalised', 'CalcOperands', 'OutstandingValue', 'OutstandingExtent', 'OutstandingDaysOff',
          'AutoIncreasedAmount', 'OutstandingReserved', 'AutomatedStpProcess', 'EstimatedValueExclVat', 'EstimatedValueVat', 'OutstandingPd',
          'AuthorisedPd', 'EstimatePd']
      }
    });
  }
}