import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { PersonEventModel } from '../../../../entities/personEvent/personEvent.model';
import { EventTypeEnum } from '../../../../enums/event-type-enum';
import { BehaviorSubject } from 'rxjs';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ICD10DiagnosticGroup } from 'projects/medicare/src/app/medi-manager/models/icd10-diagnostic-group';
import { ICD10Category } from 'projects/medicare/src/app/medi-manager/models/icd10-category';
import { ICD10SubCategory } from 'projects/medicare/src/app/medi-manager/models/icd10-sub-category';
import { ICD10Code } from 'projects/medicare/src/app/medi-manager/models/icd10-code';
import { Injury } from '../../../../entities/injury';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { ICD10CodeService } from 'projects/medicare/src/app/medi-manager/services/icd10-code-service';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { ICD10CodeEntity } from '../../../../entities/icd10-code-model';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { BodySideAffectedTypeEnum } from 'projects/shared-models-lib/src/lib/enums/body-side-affected-type-enum';
import { InjurySeverityTypeEnum } from '../../../../enums/injury-severity-type-enum';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { MatDialog } from '@angular/material/dialog';
import { EstimateBasisViewComponent } from '../estimate-basis-view/estimate-basis-view.component';
import { ReRankIcd10codesComponent } from '../re-rank-icd10codes/re-rank-icd10codes.component';
import { ICD10EstimateFilter } from 'projects/shared-models-lib/src/lib/common/icd10-estimate-filter';
import { MedicalEstimatesService } from 'projects/shared-services-lib/src/lib/services/medical-estimates/medical-estimates.service';
import { Icd10CodeEstimateAmount } from 'projects/shared-models-lib/src/lib/common/icd10-code-estimate-amount';
import { EventModel } from '../../../../entities/personEvent/event.model';
import { ClaimLiabilityStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-liability-status.enum';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { Claim } from '../../../../entities/funeral/claim.model';
import { DefaultConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { InjuryStatusEnum } from 'projects/shared-models-lib/src/lib/enums/injury-status-enum';
import { CommonNote } from 'projects/shared-models-lib/src/lib/common/common-note';
import { CommonNoteModule } from 'projects/shared-models-lib/src/lib/common/common-note-module';
import { NoteItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-item-type-enum';
import { NoteCategoryEnum } from 'projects/shared-models-lib/src/lib/enums/note-category-enum';
import { NoteTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-type-enum';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { CommonNotesService } from 'projects/shared-services-lib/src/lib/services/common-notes.service';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { PhysicalDamage } from '../../../../entities/physical-damage';
import { ClaimInvoiceService } from 'projects/claimcare/src/app/claim-manager/services/claim-invoice.service';
import { ClaimEstimate } from '../../../../entities/personEvent/claimEstimate';
import { EstimateTypeEnum } from 'projects/shared-models-lib/src/lib/enums/estimate-type-enum';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  selector: 'holistic-injury-details-view',
  templateUrl: './holistic-injury-details-view.component.html',
  styleUrls: ['./holistic-injury-details-view.component.css']
})
export class HolisticInjuryDetailsViewComponent extends UnSubscribe implements OnChanges {

  @Input() selectedPersonEvent: PersonEventModel;
  @Input() isWizard = false;
  @Input() isReadOnly = false;
  @Input() icd10List = [];

  @Output() refreshEmit: EventEmitter<boolean> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  form: UntypedFormGroup;

  diagnosticGroups: ICD10DiagnosticGroup[] = [];
  icdCategories: ICD10Category[] = [];
  icdSubCategories: ICD10SubCategory[] = [];
  icdCodes: ICD10Code[] = [];
  selectedInjury: Injury;

  severities: Lookup[] = [];
  bodySides: Lookup[] = [];
  injuryStatuses: InjuryStatusEnum[];

  hasData = false;
  drg = 0;
  action = 'add';
  menus: { title: string, action: string, disable: boolean }[];
  estimateBasisICDCodes: ICD10Code[] = [];
  viewInjuryDetails = false;
  selectedIcd10List: any[];
  showEstimateBasis = false;

  defaultIcd10EstimateAmounts: Icd10CodeEstimateAmount;
  selectedSeverity: number;

  triggerRefresh = false;

  hasCcaPermission = false;
  hasCaPermission = false;
  hasScaPermission = false;

  event: EventModel;
  claims: Claim[];
  claimEstimates: ClaimEstimate[];
  currentUser: User;
  assignedUser: User;

  dataSource = new MatTableDataSource<Injury>();

  @ViewChild(MatTable, { static: false }) table: MatTable<Injury>;
  @ViewChild(MatPaginator, { static: false }) set paginator(value: MatPaginator) {
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }
  }

  constructor(
    private readonly dialog: MatDialog,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    private readonly medicalService: ICD10CodeService,
    private readonly claimService: ClaimCareService,
    private readonly alertService: AlertService,
    private readonly medicalEstimateService: MedicalEstimatesService,
    private readonly commonNotesService: CommonNotesService,
    private readonly wizardService: WizardService,
    private readonly claimInvoiceService: ClaimInvoiceService,
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {
    super();
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.selectedPersonEvent) {
      this.event = this.selectedPersonEvent.event ? this.selectedPersonEvent.event : this.getEvent();
      this.getPhysicalDamageInjuries();
      this.getClaims();
      this.getAssignedUser();
      this.selectedPersonEvent?.physicalDamages[0]?.injuries?.sort((a, b) => a.injuryRank - b.injuryRank);
      this.estimateBasisICDCodes = [];
      this.createForm();

      if (this.icd10List?.length > 0) {
        this.selectedIcd10List = this.icd10List;
      }

      if (this.selectedPersonEvent?.physicalDamages[0]?.icd10DiagnosticGroupId > 0) {
        this.getLookups();
        this.hasData = true;
      } else {
        this.hasData = false;
      }
    }
  }

  getClaims() {
    this.isLoading$.next(true);
    this.isLoadingMessage$.next('loading claims...please wait');
    this.claimService.getPersonEventClaims(this.selectedPersonEvent.personEventId).subscribe(results => {
      if (results && results.length > 0) {
        this.claims = results;
        this.getClaimEstimates();
      }
      this.isLoading$.next(false);
    });
  }

  getEvent(): EventModel {
    this.isLoading$.next(true);
    this.isLoadingMessage$.next('loading event...please wait');
    this.claimService.getEvent(this.selectedPersonEvent.eventId).subscribe(result => {
      if (result) {
        this.event = result;
      }
      this.isLoading$.next(false);
    });
    return this.event;
  }

  getClaimEstimates() {
    this.isLoading$.next(true);
    this.isLoadingMessage$.next('loading claim estimates...please wait');
    this.claimInvoiceService.GetClaimEstimateByPersonEvent(this.selectedPersonEvent.personEventId).subscribe((results) => {
      if (results && results.length > 0) {
        this.claimEstimates = results;
      }
      this.isLoading$.next(false);
    });
  }

  getAssignedUser() {
    if (this.selectedPersonEvent?.assignedToUserId) {
      this.isLoading$.next(true);
      this.isLoadingMessage$.next('loading user...please wait');
      this.userService.getUser(this.selectedPersonEvent.assignedToUserId).subscribe(result => {
        if (result) {
          this.assignedUser = result;
        }
        this.isLoading$.next(false);
      });
    }
  }

  getPhysicalDamageInjuries() {
    this.isLoading$.next(true);
    this.isLoadingMessage$.next('loading injuries...please wait');

    this.claimService.getPhysicalDamage(this.selectedPersonEvent.personEventId).subscribe(result => {
        if (result) {
          
          if (!this.selectedPersonEvent.physicalDamages[0]?.injuries) {
            this.selectedPersonEvent.physicalDamages[0] = new PhysicalDamage();
          }

          this.selectedPersonEvent.physicalDamages[0].injuries = result.injuries;
          this.dataSource.data = this.selectedPersonEvent.physicalDamages[0].injuries.sort((a, b) => a.injuryRank - b.injuryRank);
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
          this.isLoading$.next(false);
        }
    });
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      diagnostics: [{ value: '', disabled: false }],
      codeCategory: [{ value: '', disabled: false }],
      subCategory: [{ value: '', disabled: false }],
      icdCode: [{ value: '', disabled: false }],
      severity: [{ value: '', disabled: false }],
      bodySide: [{ value: '', disabled: false }, Validators.required],
      mmiDays: [{ value: '', disabled: false }, Validators.required],
      injuryStatus: [{ value: '', disabled: false }]
    });
  }

  setForm() {
    this.diagnosticsChanged(this.selectedInjury.icd10DiagnosticGroupId);

    this.form.patchValue({
      diagnostics: this.selectedInjury.icd10DiagnosticGroupId,
      codeCategory: +this.selectedInjury.icdCategoryId,
      subCategory: +this.selectedInjury.icdSubCategoryId,
      icdCode: this.selectedInjury.icd10CodeId,
      severity: +this.selectedInjury.injurySeverityType,
      bodySide: +this.selectedInjury.bodySideAffectedType,
      mmiDays: this.selectedInjury.mmiDays,
      injuryStatus: this.selectedInjury?.injuryStatus ? InjuryStatusEnum[this.selectedInjury.injuryStatus] : InjuryStatusEnum[InjuryStatusEnum.NotValidated]
    });
  }

  calculateMmiExpiryDate(injury: Injury): string {
    if (!(injury.mmiDays && this.event?.eventDate)) { return 'N/A'; }

    const eventDate = new Date(this.event.eventDate);
    const mmiDays = +injury.mmiDays;

    eventDate.setDate(eventDate.getDate() + mmiDays);
    return eventDate.toISOString().split('T')[0]; // Returns date in YYYY-MM-DD format
  }

  getLookups() {
    this.getDiagnosticGroupsByEventTypeId(this.event?.eventType ?? EventTypeEnum.Accident);
    this.getSeverities();
    this.getBodySides();
    this.injuryStatuses = this.ToArray(InjuryStatusEnum);
  }

  getDiagnosticGroupsByEventTypeId(eventType: EventTypeEnum) {
    this.isLoading$.next(true);
    this.isLoadingMessage$.next('loading diagnostic groups...please wait');
    this.medicalService.getICD10DiagonosticGroupsByEventType(eventType).subscribe(groups => {
      this.diagnosticGroups = groups;
      this.isLoading$.next(false);
    });
  }

  diagnosticsChanged(icd10DiagnosticGroupId: number) {
    this.getIcdCategories(icd10DiagnosticGroupId, false);
  }

  getSeverities() {
    this.lookupService.getInjurySeverities().subscribe(severities => {
      this.severities = severities;
    });
  }

  getBodySides() {
    this.lookupService.getBodySides().subscribe(bodySides => {
      this.bodySides = bodySides;
    });
  }

  getIcdCategories(icd10DiagnosticGroupId: number, fromDropDown: boolean) {
    this.isLoading$.next(true);
    this.isLoadingMessage$.next('loading categories...please wait');

    this.icdCodes = [];
    this.icdSubCategories = [];
    this.icdCategories = [];
    this.form.controls.mmiDays.reset();

    this.drg = icd10DiagnosticGroupId;

    const icdModel = new ICD10CodeEntity();
    icdModel.EventType = this.event?.eventType;
    icdModel.ICD10DiagnosticGroupId = icd10DiagnosticGroupId;

    this.medicalService.getICD10CategoriesByEventTypeAndDiagnosticGroup(icdModel).subscribe(categories => {
      this.icdCategories = categories;
      if (this.selectedInjury?.icdCategoryId > 0 && !fromDropDown) {
        this.getIcdSubCategories(this.selectedInjury.icdCategoryId, false);
      }
      this.isLoading$.next(false);
    });
  }

  icdCategoriesChanged(icd10CategoryId: number) {
    this.getIcdSubCategories(icd10CategoryId, false);
  }

  getIcdSubCategories(icdCategoryId: number, fromDropDown: boolean) {
    this.isLoading$.next(true);
    this.isLoadingMessage$.next('loading sub-categories...please wait');

    const icdModel = new ICD10CodeEntity();
    icdModel.EventType = this.event?.eventType;
    icdModel.ICD10DiagnosticGroupId = this.drg;
    icdModel.ICD10CategoryId = icdCategoryId;
    this.medicalService.getICD10SubCategoriesByEventTypeDRGAndCategory(icdModel).subscribe(subCategories => {
      this.icdSubCategories = subCategories;
      if (this.selectedInjury?.icdSubCategoryId > 0 && !fromDropDown) {
        this.getIcdCodes(this.selectedInjury.icdSubCategoryId);
      }
      this.isLoading$.next(false);
    });
  }

  icdSubCategoriesChanged(icd10SubCategoryId: number) {
    this.getIcdCodes(icd10SubCategoryId);
  }

  getIcdCodes(icd10SubCategoryId: number) {
    this.isLoading$.next(true);
    this.isLoadingMessage$.next('loading icd10 codes...please wait');

    const icdModel = new ICD10CodeEntity();
    icdModel.EventType = this.event?.eventType;
    icdModel.ICD10DiagnosticGroupId = this.drg;
    icdModel.ICD10SubCategoryId = icd10SubCategoryId;

    this.medicalService.getICD10CodesByEventTypeDRGAndSubCategory(icdModel).subscribe(codes => {
      this.icdCodes = codes;
      this.isLoading$.next(false);
    });
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  disableFormControl(controlName: string) {
    if (this.form.controls[controlName]) {
      this.form.get(controlName).disable();
    }
  }

  enableFormControl(controlName: string) {
    if (this.form.controls[controlName]) {
      this.form.get(controlName).enable();
    }
  }

  disableControls() {
    this.disableFormControl('diagnostics');
    this.disableFormControl('codeCategory');
    this.disableFormControl('subCategory');
    this.disableFormControl('icdCode');
    this.disableFormControl('severity');
    this.disableFormControl('bodySide');
    this.disableFormControl('injuryStatus');
  }

  enableControls() {
    this.enableFormControl('diagnostics');
    this.enableFormControl('codeCategory');
    this.enableFormControl('subCategory');
    this.enableFormControl('icdCode');
    this.enableFormControl('severity');
    this.enableFormControl('bodySide');
    this.enableFormControl('injuryStatus');
  }

  ToArray(anyEnum: { [x: string]: any }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum).filter(StringIsNumber).map((key) => anyEnum[key]);
  }

  getBodySide(bodySideId: number): string {
    const statusText = BodySideAffectedTypeEnum[bodySideId];
    return statusText;
  }

  getSeverity(SeverityId: number): string {
    const statusText = InjurySeverityTypeEnum[SeverityId];
    return statusText;
  }

  getInjuryStatus(injuryStatusId: number): string {
    const statusText = InjuryStatusEnum[injuryStatusId];
    return statusText === 'Valid' ? statusText : 'Invalid';
  }

  add() {
    this.form.reset();
    this.enableControls();
    this.viewInjuryDetails = true;
    this.hasData = false;
    this.action = 'add';
  }

  edit($event: Injury) {
    this.selectedInjury = $event;
    this.viewInjuryDetails = true;
    this.hasData = false;
    this.action = 'edit';
    this.setForm();
  }

  delete($event: Injury) {
    this.selectedInjury = $event;

    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: 'Delete ICD10 Code',
        text: `Are you sure you want to delete?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading$.next(true);
        this.isLoadingMessage$.next('deleting icd10 code details...please wait');

        const icdModel = new ICD10CodeEntity();
        icdModel.EventType = this.event?.eventType;
        icdModel.ICD10DiagnosticGroupId = this.selectedInjury.icd10DiagnosticGroupId;
        icdModel.ICD10SubCategoryId = this.selectedInjury.icdSubCategoryId;

        this.medicalService.getICD10CodesByEventTypeDRGAndSubCategory(icdModel).subscribe(codes => {
          this.icdCodes = codes;
          const icd10Code = this.icdCodes.find(s => s.icd10CodeId == this.selectedInjury.icd10CodeId);

          this.selectedPersonEvent.physicalDamages[0].injuries = this.selectedPersonEvent.physicalDamages[0].injuries || [];
          const index = this.selectedPersonEvent.physicalDamages[0].injuries.indexOf(this.selectedInjury);
          if (index > -1) {
            this.selectedPersonEvent.physicalDamages[0].injuries[index].isDeleted = true;
            this.claimService.updatePersonEvent(this.selectedPersonEvent).subscribe(result => {
              if (result) {
                this.estimateBasisICDCodes = [];
                this.getPhysicalDamageInjuries();
                this.refreshEmit.emit(!this.triggerRefresh);
                this.alertService.success('Injury icd10 code details deleted successfully');
                this.addNote(`Injury ICD10 code deleted: (${icd10Code.icd10Code}) ${icd10Code.icd10CodeDescription}`, NoteTypeEnum.ICD10Review);
              }
            });
          }
        });
      }
    });
  }

  save() {
    this.isLoading$.next(true);
    this.isLoadingMessage$.next('saving icd10 code details...please wait');
    const injury = this.readForm();
    const icd10Code = this.icdCodes.find(s => s.icd10CodeId == injury.icd10CodeId);

    this.claimService.updatePersonEvent(this.selectedPersonEvent).subscribe(result => {
      if (result) {
        this.getPhysicalDamageInjuries();
        if (this.action == 'add') {
          this.alertService.success('Injury icd10 code details added successfully');
          this.addNote(`Injury ICD10 code added: (${icd10Code.icd10Code}) ${icd10Code.icd10CodeDescription}`, NoteTypeEnum.ICD10Captured);
        } else {
          this.alertService.success('Injury icd10 code details updated successfully');
          this.addNote(`Injury ICD10 code updated: (${icd10Code.icd10Code}) ${icd10Code.icd10CodeDescription}`, NoteTypeEnum.ICD10Review);
        }
        this.reset();
      }
    });
  }

  cancel() {
    this.reset();
  }

  reset() {
    this.selectedInjury = null;

    this.icdCodes = [];
    this.icdSubCategories = [];
    this.icdCategories = [];

    this.viewInjuryDetails = false;
    this.hasData = true;

    this.defaultIcd10EstimateAmounts = null;
    this.selectedSeverity = null;

    this.form.reset();
  }

  readForm(): Injury {
    const formDetails = this.form.getRawValue();

    const injury = this.selectedInjury ? this.selectedInjury : new Injury();

    injury.physicalDamageId = this.selectedPersonEvent.physicalDamages[0].physicalDamageId;

    injury.icd10DiagnosticGroupId = formDetails.diagnostics;
    injury.icdCategoryId = formDetails.codeCategory;
    injury.icdSubCategoryId = formDetails.subCategory;
    injury.icd10CodeId = formDetails.icdCode;

    injury.injurySeverityType = formDetails.severity;
    injury.bodySideAffectedType = formDetails.bodySide;

    injury.mmiDays = formDetails.mmiDays;
    injury.injuryStatus = formDetails.injuryStatus;

    this.selectedPersonEvent.physicalDamages[0].injuries
      = this.selectedPersonEvent.physicalDamages[0].injuries ? this.selectedPersonEvent.physicalDamages[0].injuries : [];
    const index = this.selectedPersonEvent.physicalDamages[0].injuries.indexOf(injury);
    if (index > -1) {
      this.selectedPersonEvent.physicalDamages[0].injuries[index] = injury;
      this.selectedPersonEvent.physicalDamages[0].injuries.sort((a, b) => b.mmiDays - a.mmiDays);
      let rank = 1;
      for (const injury of this.selectedPersonEvent.physicalDamages[0].injuries) {
          if (!injury.isDeleted) {
              injury.injuryRank = rank++;
          }
      }
    } else {
      injury.injuryRank = this.selectedPersonEvent.physicalDamages[0].injuries.length + 1;
      this.selectedPersonEvent.physicalDamages[0].injuries.push(injury);
      
      this.selectedPersonEvent.physicalDamages[0].injuries.sort((a, b) => b.mmiDays - a.mmiDays);

      const newInjuryId = this.selectedPersonEvent.physicalDamages[0].injuries[0].injuryId;
      const hasTopRankedInjuryChanged = newInjuryId == null || newInjuryId <= 0;

      //icd-10 codes are automatically ranked by the highest MMI days.
      let rank = 1;
      for (const injury of this.selectedPersonEvent.physicalDamages[0].injuries) {
          if (!injury.isDeleted) {
              injury.injuryRank = rank++;
          }
      }

      if (hasTopRankedInjuryChanged
          && (this.hasCaPermission || this.hasScaPermission)) {
        // trigger workflow if either user is CA/SCA
        this.startReviewInjuryIcd10CodesWizard();
      }
    }
    return injury;
  }

  setIcd10Code($event: ICD10Code) {
    const index = this.estimateBasisICDCodes.findIndex(s => s.icd10CodeId == $event.icd10CodeId);
    if (index == -1) {
      this.estimateBasisICDCodes.push($event);
    }
  }

  openEstimateBasis() {
    const dialogRef = this.dialog.open(EstimateBasisViewComponent, {
      width: '1224px',
      disableClose: true,
      data: {
        icd10Codes: this.estimateBasisICDCodes,
        personEvent: this.selectedPersonEvent
      }
    });
  }

  reRank() {
    const dialogRef = this.dialog.open(ReRankIcd10codesComponent, {
      width: '70%',
      disableClose: true,
      data: {
        injuries: JSON.parse(JSON.stringify(this.selectedPersonEvent.physicalDamages[0].injuries)) as Injury[]
      }
    });

    dialogRef.afterClosed().subscribe(results => {
      if (results) {
        this.isLoading$.next(true);
        this.isLoadingMessage$.next('re-ranking icd10 code...please wait');
        this.selectedPersonEvent.physicalDamages[0].injuries = results;
        const topRankedInjury = this.selectedPersonEvent.physicalDamages[0].injuries.find(s => s.injuryRank == 1);
        this.selectedPersonEvent.physicalDamages[0].icd10DiagnosticGroupId = topRankedInjury.icd10DiagnosticGroupId;
        this.claimService.updatePersonEvent(this.selectedPersonEvent).subscribe(result => {
          if (result) {
            this.getPhysicalDamageInjuries();
            this.refreshEmit.emit(!this.triggerRefresh);
            this.addNote(`Injury ICD10 code manually re-ranked`, NoteTypeEnum.ICD10ReRanking);
            this.alertService.success('Injuries icd10 code re-ranked successfully');
            this.isLoading$.next(false);
          }
        });
      }
    });
  }

  getDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'icd10CodeDescription', show: true },
      { def: 'injurySeverityTypeDesc', show: true },
      { def: 'bodySideAffectedTypeDesc', show: true },
      { def: 'createdDate', show: true },
      { def: 'createdBy', show: true },
      { def: 'mmiDays', show: true },
      { def: 'injuryRank', show: true },
      { def: 'mmiExpiryDate', show: true },
      { def: 'injuryStatus', show: true },
      { def: 'actions', show: !this.isReadOnly && this.checkUserPermissions() && this.checkClaimStatus()},
    ];

    return columnDefinitions.filter((cd) => cd.show).map((cd) => cd.def);
  }

  icd10CodeSelected(icd10CodeId: number) {
    this.isLoading$.next(true);
    this.isLoadingMessage$.next('loading default MMI estimate...please wait');

    const icd10Code = this.icdCodes.find(s => s.icd10CodeId == icd10CodeId);
    if (icd10Code) {
      const code = icd10Code.icd10Code;
      this.getMedicalEstimates(code, new Date());
    }
  }

  getMedicalEstimates(codes: string, reportDate: Date) {
    let icd10CodeFilter = new ICD10EstimateFilter();

    icd10CodeFilter.eventType = this.event?.eventType;
    icd10CodeFilter.icd10Codes = codes;
    icd10CodeFilter.reportDate = new Date(reportDate);

    this.medicalEstimateService.getICD10Estimates(icd10CodeFilter).subscribe(results => {
      if (results?.length > 0) {
        this.defaultIcd10EstimateAmounts = results[results.length - 1];
        this.setDefaultEstimateMmiDaysBasedOnSeverity();
      }
      this.isLoading$.next(false);
    });
  }

  severitySelected($event: number) {
    this.selectedSeverity = +$event;
    this.setDefaultEstimateMmiDaysBasedOnSeverity();
  }

  setDefaultEstimateMmiDaysBasedOnSeverity() {
    if (this.defaultIcd10EstimateAmounts && this.selectedSeverity) {
      var defaultEstimateMmiDays = 0;

      switch (this.selectedSeverity) {
        case +InjurySeverityTypeEnum.Mild:
          defaultEstimateMmiDays = this.defaultIcd10EstimateAmounts.daysOffMinimum;
          break;
        case +InjurySeverityTypeEnum.Moderate:
          defaultEstimateMmiDays = this.defaultIcd10EstimateAmounts.daysOffAverage;
          break;
        case +InjurySeverityTypeEnum.Severe:
          defaultEstimateMmiDays = this.defaultIcd10EstimateAmounts.daysOffMaximum;
          break;
        default:
          defaultEstimateMmiDays = 0;
          break;
      }
      this.form.patchValue({
        mmiDays: defaultEstimateMmiDays
      });
    }
  }

  refresh() {
    this.getPhysicalDamageInjuries();
  }

  checkClaimStatus(): boolean {
    return this.claims?.some(s => s.claimStatus != ClaimStatusEnum.Closed && 
      (s.claimLiabilityStatus == ClaimLiabilityStatusEnum.MedicalLiability 
        || s.claimLiabilityStatus == ClaimLiabilityStatusEnum.LiabilityAccepted 
        || s.claimLiabilityStatus == ClaimLiabilityStatusEnum.FullLiabilityAccepted 
        || s.claimLiabilityStatus == ClaimLiabilityStatusEnum.Accepted
        || s.claimLiabilityStatus == ClaimLiabilityStatusEnum.Pending));
  }

  checkUserPermissions(action?: string): boolean {
    this.hasCcaPermission = this.userHasPermission('Cca Pool');
    this.hasCaPermission = this.userHasPermission('Claims Assessor Pool');
    this.hasScaPermission = this.userHasPermission('Sca Pool');

    const actionPermissions = {
      'calculate': [this.hasCcaPermission],
      'rank': [this.hasCcaPermission],
      'add': [this.hasCcaPermission, this.hasCaPermission, this.hasScaPermission]
    };

    if (actionPermissions[action]) {
      return actionPermissions[action].some(permission => permission);
    }

    return this.hasCcaPermission || this.hasCaPermission || this.hasScaPermission;
  }

  addNote(message: string, noteType: NoteTypeEnum) {
    const commonSystemNote = new CommonNote();
    commonSystemNote.itemId = this.selectedPersonEvent.personEventId;
    commonSystemNote.noteCategory = NoteCategoryEnum.PersonEvent;
    commonSystemNote.noteItemType = NoteItemTypeEnum.PersonEvent;
    commonSystemNote.noteType = noteType;
    commonSystemNote.text = message;
    commonSystemNote.isActive = true;

    commonSystemNote.noteModules = [];
    const moduleType = new CommonNoteModule();
    moduleType.moduleType = ModuleTypeEnum.ClaimCare;
    commonSystemNote.noteModules.push(moduleType);

    this.commonNotesService.addNote(commonSystemNote).subscribe(result => { });
  }

  startReviewInjuryIcd10CodesWizard() {
    var startWizardRequest = new StartWizardRequest();
    startWizardRequest.linkedItemId = this.selectedPersonEvent.personEventId;
    startWizardRequest.type = 'review-injury-icd10-codes';
    startWizardRequest.data = JSON.stringify(this.selectedPersonEvent);
    startWizardRequest.lockedToUser = null;

    this.wizardService.startWizard(startWizardRequest).subscribe(_ => {
      this.alertService.success('Review injury claim management workflow created...');
    });
  }

  recalculateClaimEstimates() {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: 'Recalculate PD Estimate',
        text: `Are you sure you want to recalculate PD estimate?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading$.next(true);
        this.isLoadingMessage$.next('updating estimates...please wait');

        const injury = this.selectedPersonEvent.physicalDamages[0].injuries.find(s => s.injuryRank == 1);

        const icdModel = new ICD10CodeEntity();
        icdModel.EventType = this.event?.eventType;
        icdModel.ICD10DiagnosticGroupId = injury.icd10DiagnosticGroupId;
        icdModel.ICD10SubCategoryId = injury.icdSubCategoryId;

        this.medicalService.getICD10CodesByEventTypeDRGAndSubCategory(icdModel).subscribe(codes => {
          this.icdCodes = codes;
          const icd10Code = this.findICD10Code(injury);

          let icd10CodeFilter = new ICD10EstimateFilter();
          icd10CodeFilter.eventType = this.event?.eventType;
          icd10CodeFilter.icd10Codes = icd10Code;
          icd10CodeFilter.reportDate = new Date();

          this.medicalEstimateService.getICD10Estimates(icd10CodeFilter).subscribe(results => {
            if (results?.length > 0) {
              this.defaultIcd10EstimateAmounts = results[results.length - 1];
              this.updateClaimEstimates(injury);
            }
          });
        });
      }
    });
  }

  findICD10Code(injury: Injury): string {
    return this.icdCodes.find(s => s.icd10CodeId == injury.icd10CodeId)?.icd10Code;
  }

  updateClaimEstimates(injury: Injury) {
    let newEstimatePd = 0;
    const newEstimateDaysOff = injury.mmiDays;

    if (this.defaultIcd10EstimateAmounts) {
      switch (injury.injurySeverityType) {
        case +InjurySeverityTypeEnum.Mild:
          newEstimatePd = this.defaultIcd10EstimateAmounts.pdExtentMinimum;
          break;
        case +InjurySeverityTypeEnum.Moderate:
          newEstimatePd = this.defaultIcd10EstimateAmounts.pdExtentAverage;
          break;
        case +InjurySeverityTypeEnum.Severe:
          newEstimatePd = this.defaultIcd10EstimateAmounts.pdExtentMaximum;
          break;
      }
    }

    this.claimEstimates.forEach(claimEstimate => {
      if (claimEstimate.estimateType == EstimateTypeEnum.TTD
        || claimEstimate.estimateType == EstimateTypeEnum.ShiftLoss
        || claimEstimate.estimateType == EstimateTypeEnum.TPD) {
        claimEstimate.estimatedDaysOff = newEstimateDaysOff;
      }

      if (claimEstimate.estimateType == EstimateTypeEnum.PDLumpSum
        || claimEstimate.estimateType == EstimateTypeEnum.PDPension) {
        claimEstimate.estimatePd = newEstimatePd;
      }
    });

    this.claimInvoiceService.recalculateClaimEstimates(this.claimEstimates).subscribe(result => {
      this.alertService.success('Estimates updated successfully...');
      this.isLoading$.next(false);
    });
  }
}
