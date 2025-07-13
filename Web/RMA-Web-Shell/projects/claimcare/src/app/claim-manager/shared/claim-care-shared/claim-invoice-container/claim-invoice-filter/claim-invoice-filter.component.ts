import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { ClaimInvoiceDialogComponent } from '../claim-invoice-dialog/claim-invoice-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { SundryInvoice } from '../invoice-sundry/sundry-invoice';
import { FuneralExpenseInvoice } from '../invoice-funeral-expenses/funeral-expense-invoice';
import { WidowLumpSumInvoice } from '../invoice-widow-lump-sum/widow-lump-sum-invoice';
import { TotalTemporaryDisability } from '../total-temporary-disability/totalTemporaryDisability';
import { FatalPDLumpSumInvoice } from '../invoice-partial-dependency-lump-sum/fatal-pd-lump-sum-invoice';
import { ClaimCareService } from '../../../../Services/claimcare.service';
import { EventCause } from '../../../entities/eventCause';
import { ICD10DiagnosticGroup } from 'projects/medicare/src/app/medi-manager/models/icd10-diagnostic-group';
import { DiseaseType } from '../../../entities/diseaseType';
import { EventTypeEnum } from '../../../enums/event-type-enum';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ICD10CodeService } from 'projects/medicare/src/app/medi-manager/services/icd10-code-service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { ICD10Category } from 'projects/medicare/src/app/medi-manager/models/icd10-category';
import { ClaimBucketClassModel } from '../../../entities/personEvent/claimBucketClass.model';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { ClaimLiabilityStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-liability-status.enum';
import { ClaimEarningService } from '../../../../Services/claim-earning.service';
import { ClaimInvoiceService } from '../../../../services/claim-invoice.service';
import { EstimateTypeEnum } from 'projects/shared-models-lib/src/lib/enums/estimate-type-enum';
import { Claim } from '../../../entities/funeral/claim.model';
import { ClaimEstimate } from '../../../entities/personEvent/claimEstimate';
import { FatalLumpSumInvoice } from '../invoice-fatal-lump-sum/fatal-lump-sum-invoice';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { EarningsTypeEnum } from 'projects/shared-models-lib/src/lib/enums/earnings-type-enum';

@Component({
  selector: 'claim-invoice-filter',
  templateUrl: './claim-invoice-filter.component.html',
  styleUrls: ['./claim-invoice-filter.component.css']
})
export class ClaimInvoiceFilterComponent extends UnSubscribe implements OnChanges {

  @Input() personEvent: PersonEventModel;
  @Input() claim: Claim;

  @Output() invoiceTypeEmit: EventEmitter<ClaimInvoiceTypeEnum> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  viewPermission = 'View Claim Invoice Filter'
  editPermission = 'Edit Claim Invoice Filter'
  hasCadPermission = false;
  hasCcaPermission = false;
  hasScaPermission = false;
  hasCmcPermission = false;
  hasCaPermission = false;

  displayMessage: string;
  form: any;
  invoiceTypes: ClaimInvoiceTypeEnum[];
  claimInvoiceType: ClaimInvoiceTypeEnum;
  canAddInvoice = false;
  isFatal = false;
  isEarningsVerified = false;
  isEarningsCaptured = false;
  isCurrentEarningsCaptured = false;
  isFuneralEstimates = false;
  isTravelEstimates = false;
  isWidowLumpsumEstimates = false;
  causeOfDiseases: EventCause[];
  drgFatal: ICD10DiagnosticGroup;
  typeOfDiseases: DiseaseType[];

  diagnosticGroups: ICD10DiagnosticGroup[] = [];
  filteredDiagnostics: ICD10DiagnosticGroup[];

  severities: Lookup[] = [];
  filteredSeverities: Lookup[];

  icdCategories: ICD10Category[] = [];
  filteredIcdCategories: ICD10Category[];
  benefits: ClaimBucketClassModel[];
  filteredBenefits: ClaimBucketClassModel[];
  claimEstimates: ClaimEstimate[] = [];

  currentUser: User;

  constructor(
    private readonly formBuilder: FormBuilder,
    public dialog: MatDialog,
    private readonly claimService: ClaimCareService,
    private readonly lookupService: LookupService,
    private readonly medicalService: ICD10CodeService,
    private claimEarningService: ClaimEarningService,
    private readonly claimInvoiceService: ClaimInvoiceService,
    private readonly authService: AuthService
  ) {
    super();

    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getData();
    this.verifyPermissions();
  }

  verifyPermissions() {
    this.hasCadPermission = this.userHasPermission('Cad Pool');
    this.hasCcaPermission = this.userHasPermission('Cca Pool');
    this.hasScaPermission = this.userHasPermission('Sca Pool');
    this.hasCmcPermission = this.userHasPermission('Cmc Pool');
    this.hasCaPermission = this.userHasPermission('Claims Assessor Pool');
  }

  getLookups() {
    this.invoiceTypes = this.ToArray(ClaimInvoiceTypeEnum);
  }

  getData() {
    this.isLoading$.next(true);
    this.isFatal = false;
    this.getLookups();

    forkJoin([
      this.medicalService.getICD10DiagonosticGroupsByEventType(EventTypeEnum.Disease),
      this.lookupService.getInjurySeverities(),
      this.claimService.getClaimBucketClasses()
    ]).subscribe(
      result => {
        this.diagnosticGroups = result[0];
        this.filteredDiagnostics = result[0];
        this.drgFatal = this.diagnosticGroups.find(d => d.code === 'DRG00');

        this.severities = result[1];
        this.filteredSeverities = result[1];

        this.benefits = result[2];
        this.filteredBenefits = result[2];

        if (this.personEvent.physicalDamages && this.drgFatal.icd10DiagnosticGroupId === this.personEvent.physicalDamages[0].icd10DiagnosticGroupId) {
          this.isFatal = true;
        }

        if (this.personEvent.personEventDeathDetail && this.personEvent.personEventDeathDetail.deathDate) {
          this.isFatal = true;
        }

        if (!this.isFatal) {
          this.invoiceTypes.splice(this.invoiceTypes.findIndex(a => a.toString() === ClaimInvoiceTypeEnum[ClaimInvoiceTypeEnum.WidowLumpSumAward]), 1);
          this.invoiceTypes.splice(this.invoiceTypes.findIndex(a => a.toString() === ClaimInvoiceTypeEnum[ClaimInvoiceTypeEnum.FuneralExpenses]), 1);
          this.invoiceTypes.splice(this.invoiceTypes.findIndex(a => a.toString() === ClaimInvoiceTypeEnum[ClaimInvoiceTypeEnum.FatalLumpSumAward]), 1);
          this.invoiceTypes.splice(this.invoiceTypes.findIndex(a => a.toString() === ClaimInvoiceTypeEnum[ClaimInvoiceTypeEnum.PartialDependencyLumpsum]), 1);
        }

        if (!this.currentUser?.isInternalUser) {
          this.invoiceTypes = this.invoiceTypes.filter(s => s.toString() == ClaimInvoiceTypeEnum[ClaimInvoiceTypeEnum.DaysOffInvoice]);
        }
      },
      error => {
        this.isLoading$.next(false);
      }
    );

    this.claimEarningService.getEarningsByPersonEventId(this.personEvent.personEventId).subscribe(results => {
      if (results?.length > 0) {
        this.isEarningsVerified = results.some(({ isVerified, isEstimated }) => isVerified && !isEstimated);
        this.isEarningsCaptured = results.some(({ isEstimated }) => !isEstimated);
        this.isCurrentEarningsCaptured = results.some(({ earningsType }) => earningsType === EarningsTypeEnum.Current);
      }
    });

    this.claimInvoiceService.getClaimEstimateByPersonEventAndEstimateType(EstimateTypeEnum.Funeral, this.personEvent.personEventId).subscribe(result => {
      if (result && result.length > 0) {
        this.isFuneralEstimates = true;
      }
    })

    this.claimInvoiceService.getClaimEstimateByPersonEventAndEstimateType(EstimateTypeEnum.WidowsLumpSum, this.personEvent.personEventId).subscribe(result => {
      if (result && result.length > 0) {
        this.isWidowLumpsumEstimates = true;
      }
    })

    this.claimInvoiceService.getClaimEstimateByPersonEventAndEstimateType(EstimateTypeEnum.TravelExpenses, this.personEvent.personEventId).subscribe(result => {
      if (result && result.length > 0) {
        this.isTravelEstimates = true;
      }
    })

    this.claimInvoiceService.GetClaimEstimateByPersonEvent(this.personEvent.personEventId).subscribe(results => {
      if (results && results.length > 0) {
        this.claimEstimates = results;
      }
    });

    this.createForm();
    this.isLoading$.next(false);
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      invoiceTypeFilter: [{ value: null, disabled: false }]
    });
  }

  invoiceTypeChanged($event: ClaimInvoiceTypeEnum) {
    this.claimInvoiceType = $event;
    this.invoiceTypeEmit.emit($event);

    this.resetInvoiceState();

    this.checkFatalCondition();

    let selectedType = +ClaimInvoiceTypeEnum[this.claimInvoiceType];
    switch (selectedType) {
      case ClaimInvoiceTypeEnum.DaysOffInvoice:
        const message = [];
        //products like riot dont have days off benefit
        if (!this.claimEstimates.some(c => c.estimateType === EstimateTypeEnum.TTD)) {
          message.push('Cannot capture days off invoice as product does not support this benefit');
          this.displayMessage = message.join('<br />');
        }

        if (this.claimEstimates.some(c => c.estimateType === EstimateTypeEnum.TTD)) {
          const daysOffEstimate = this.claimEstimates.find(e => e.estimateType === EstimateTypeEnum.TTD);
          if (daysOffEstimate?.estimatedDaysOff < 4) {
            message.push('Cannot capture days off invoice as estimated days off are less than 4 days');
            this.displayMessage = message.join('<br />');
          }
        }

        if (!this.isEarningsCaptured) {
          message.push(`Cannot capture days off invoice on a claim with no earnings`);
          this.displayMessage = message.join('<br />');
        }

        if (this.isClaimOlderThanTwoYears() && !this.isCurrentEarningsCaptured) {
          message.push(`Cannot capture days off invoice on a claim that is older than 2 years with no current earnings`);
          this.displayMessage = message.join('<br />');
        }
        
        this.canAddInvoice = message.length > 0 ? false : true;

        break;
      case ClaimInvoiceTypeEnum.PDAward:
        this.canAddInvoice = false;
        break;
      case ClaimInvoiceTypeEnum.Pension:
        if (this.hasCadPermission || this.hasCcaPermission || this.hasScaPermission || this.hasCmcPermission || this.hasCaPermission) {
          this.canAddInvoice = true;
        } else {
          this.displayMessage = this.currentUser.roleName + ' cannot capture the invoice due to permission';
        }
        break;
      case ClaimInvoiceTypeEnum.TravelAward:
        const hasAnyPermission = this.hasCadPermission || this.hasCcaPermission || this.hasScaPermission || this.hasCmcPermission || this.hasCaPermission;
        if (hasAnyPermission && this.isTravelEstimates) {
          this.canAddInvoice = true;
        } else {
          const message = [];
          this.canAddInvoice = false;
          this.displayMessage = `${this.currentUser.roleName} cannot capture the invoice due to permission`;
          if (!this.isTravelEstimates) {
            message.push(`No estimates for the selected invoice type`);
          }
        }
        break;
      case ClaimInvoiceTypeEnum.WidowLumpSumAward:
      case ClaimInvoiceTypeEnum.FuneralExpenses:
        if (this.hasCmcPermission && this.isFatal) {
          this.canAddInvoice = true;
          const message = [];
          if (this.personEvent.claims[0].claimLiabilityStatus === ClaimLiabilityStatusEnum.Pending) {
            this.canAddInvoice = false;
            message.push(`Cannot capture invoice because liability status is - ${this.formatLookup(ClaimLiabilityStatusEnum[this.personEvent.claims[0].claimLiabilityStatus])}`);
          }
          if (!this.isEarningsVerified) {
            this.canAddInvoice = false;
            message.push(`Cannot capture invoice on a claim with no verified earnings`);
          }
          if ((selectedType === ClaimInvoiceTypeEnum.WidowLumpSumAward && !this.isWidowLumpsumEstimates) ||
            (selectedType === ClaimInvoiceTypeEnum.FuneralExpenses && !this.isFuneralEstimates)) {
            this.canAddInvoice = false;
            message.push(`No estimates for the selected invoice type`);
          }
          this.displayMessage = message.join('. ');
        }
        break;
      case ClaimInvoiceTypeEnum.PartialDependencyLumpsum:
      case ClaimInvoiceTypeEnum.SundryInvoice:
        if (this.hasCcaPermission || this.hasScaPermission || this.hasCmcPermission || this.hasCaPermission) {
          this.canAddInvoice = true;
        } else {
          this.displayMessage = this.currentUser.roleName + ' cannot capture the invoice due to permission';
        }
        break;
      case ClaimInvoiceTypeEnum.FatalLumpSumAward:
        if (this.hasCadPermission || this.hasCcaPermission || this.hasScaPermission || this.hasCmcPermission || this.hasCaPermission) {
          this.canAddInvoice = true;
        } else {
          this.displayMessage = this.currentUser.roleName + ' cannot capture the invoice due to permission';
        }
        break;
      default:
        break;
    }

    this.checkClaimStatus();
  }

  resetInvoiceState() {
    this.displayMessage = '';
    this.canAddInvoice = false;
    this.isFatal = false;
  }

  checkFatalCondition() {
    if (this.drgFatal) {
      if (this.personEvent.physicalDamages && this.drgFatal.icd10DiagnosticGroupId === this.personEvent.physicalDamages[0].icd10DiagnosticGroupId) {
        this.isFatal = true;
      }
    }

    if (this.personEvent.personEventDeathDetail && this.personEvent.personEventDeathDetail.deathDate) {
      this.isFatal = true;
    }
  }

  isClaimOlderThanTwoYears(): boolean {
    const eventDate = this.personEvent.event.eventDate;
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    return eventDate < twoYearsAgo;
  }

  checkClaimStatus() {
    const claimStatus = this.personEvent.claims[0].claimStatus;
    const claimStatuses = [
      ClaimStatusEnum.PendingInvestigations,
      ClaimStatusEnum.Closed,
      ClaimStatusEnum.Declined,
      ClaimStatusEnum.Finalized,
      ClaimStatusEnum.Paid
    ];

    if (claimStatuses.includes(claimStatus)) {
      if (claimStatus === ClaimStatusEnum.Closed && this.claimInvoiceType === ClaimInvoiceTypeEnum.DaysOffInvoice) {
        if (this.canAddInvoice) {
          this.canAddInvoice = true;
        }
      }
      else {
        this.canAddInvoice = false;
        this.displayMessage = 'Cannot capture invoice because claim status is - ' + this.getClaimStatus(claimStatus);
      }
    }
  }

  getClaimStatus(id: number) {
    if (id <= 0) { return };
    const statusName = this.formatText(ClaimStatusEnum[id]);
    return statusName === 'Finalized' ? 'Closed' : statusName;
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  openInvoiceDialog() {
    const dialogRef = this.dialog.open(ClaimInvoiceDialogComponent, {
      width: '70%',
      disableClose: true,
      data: {
        claimInvoiceType: ClaimInvoiceTypeEnum[this.claimInvoiceType],
        claimInvoice: this.getInvoiceType(),
        personEvent: this.personEvent,
        invoiceAction: 'edit',
        invoiceType: this.claimInvoiceType,
        claim: this.claim,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.invoiceTypeChanged(this.claimInvoiceType);
    })
  }

  getInvoiceType() {
    const selectedInvoiceType = +ClaimInvoiceTypeEnum[this.claimInvoiceType];

    switch (selectedInvoiceType) {
      case ClaimInvoiceTypeEnum.SundryInvoice:
        return new SundryInvoice();
      case ClaimInvoiceTypeEnum.FuneralExpenses:
        return new FuneralExpenseInvoice();
      case ClaimInvoiceTypeEnum.WidowLumpSumAward:
        return new WidowLumpSumInvoice();
      case ClaimInvoiceTypeEnum.DaysOffInvoice:
        return new TotalTemporaryDisability();
      case ClaimInvoiceTypeEnum.PartialDependencyLumpsum:
        return new FatalPDLumpSumInvoice();
      case ClaimInvoiceTypeEnum.FatalLumpSumAward:
        return new FatalLumpSumInvoice();
    }
  }
}
