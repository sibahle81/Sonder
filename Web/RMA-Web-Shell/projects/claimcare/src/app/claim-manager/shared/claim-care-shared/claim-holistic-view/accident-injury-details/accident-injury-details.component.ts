import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { PersonEventModel } from '../../../../shared/entities/personEvent/personEvent.model';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { ICD10DiagnosticGroup } from 'projects/medicare/src/app/medi-manager/models/icd10-diagnostic-group';
import { ClaimTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-type-enum';
import { InjuryStatusEnum } from 'projects/shared-models-lib/src/lib/enums/injury-status-enum';
import { ProductClassEnum } from 'projects/shared-models-lib/src/lib/enums/product-class-enum';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { DateValidator } from 'projects/shared-utilities-lib/src/lib/validators/date-validator';
import { ClaimCareService } from '../../../../Services/claimcare.service';
import { CauseOfDeathModel } from '../../../../shared/entities/funeral/cause-of-death.model';
import { PersonEventAccidentDetail } from '../../../../shared/entities/funeral/person-event-accident-detail';
import { Injury } from '../../../../shared/entities/injury';
import { ParentInsuranceType } from '../../../../shared/entities/parentInsuranceType';
import { ClaimBucketClassModel } from '../../../../shared/entities/personEvent/claimBucketClass.model';
import { PersonEventDeathDetailModel } from '../../../../shared/entities/personEvent/personEventDeathDetail.model';
import { PhysicalDamage } from '../../../../shared/entities/physical-damage';
import { DeathTypeEnum } from '../../../../shared/enums/deathType.enum';
import { EventTypeEnum } from '../../../../shared/enums/event-type-enum';
import { InjurySeverityTypeEnum } from '../../../../shared/enums/injury-severity-type-enum';
import { HolisticBeneficiaryContainerComponent } from '../../../../shared/claim-care-shared/claim-holistic-view/holistic-container-beneficiary/holistic-beneficiary-container/holistic-beneficiary-container.component';
import { Constants } from 'projects/claimcare/src/app/constants';
import { ICD10CodeService } from 'projects/medicare/src/app/medi-manager/services/icd10-code-service';
import { ModeEnum } from 'projects/shared-models-lib/src/lib/enums/mode-enum';
import { TimeValidators } from 'projects/shared-utilities-lib/src/lib/validators/time-validator';
import { ProductCategoryTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/product-category-type.enum';
import { ICD10CodeEntity } from '../../../entities/icd10-code-model';
import { ICD10Category } from 'projects/medicare/src/app/medi-manager/models/icd10-category';
import { ICD10SubCategory } from 'projects/medicare/src/app/medi-manager/models/icd10-sub-category';
import { ICD10Code } from 'projects/medicare/src/app/medi-manager/models/icd10-code';

@Component({
  selector: 'accident-injury-details',
  templateUrl: './accident-injury-details.component.html',
  styleUrls: ['./accident-injury-details.component.css']
})
export class AccidentInjuryDetailsComponent implements OnChanges {

  @Input() selectedPersonEvent: PersonEventModel;
  @Input() isWizard = false;
  @Input() isReadOnly = false;
  @Input() eventType: EventTypeEnum;
  @Input() eventDate: Date;
  @Input() mode = ModeEnum.Default;
  @Input() productCategoryType: ProductCategoryTypeEnum;

  @Output() addPersonEvent = new EventEmitter<PersonEventModel>();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isSaving$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isClaimTypeLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isDiagnosticLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  injuries: Injury[] = [];
  severities: Lookup[] = [];
  bodySides: Lookup[] = [];
  claimTypes: Lookup[] = [];
  form: UntypedFormGroup;
  viewMode = ModeEnum.View;

  insuranceTypes: ParentInsuranceType[] = [];
  filteredInsuranceTypes: ParentInsuranceType[];

  filteredClaimTypes: Lookup[];
  filteredBenefits: ClaimBucketClassModel[];

  diagnosticGroups: ICD10DiagnosticGroup[] = [];
  filteredDiagnostics: ICD10DiagnosticGroup[];
  icdCategories: ICD10Category[];
  icdSubCategories: ICD10SubCategory[];
  icdCodes: ICD10Code[]

  filteredSeverities: Lookup[];
  filteredBodySides: Lookup[];

  claimType: Lookup;
  fatal = 'Fatals';
  currentUser: string;

  hasBeneficiaryDetails = false;
  isInjuryDetails = false;
  isRoadAccident = false;
  isAssault = false;
  isStatutory = false;

  ledToDeath = false;
  maxDate = new Date();
  user: User;
  drg = 0;
  drgIndex = 0;
  drgFatal: ICD10DiagnosticGroup;
  benefits: ClaimBucketClassModel[];
  originalBenefitList: ClaimBucketClassModel[];
  viewInsuranceDetails: boolean;
  causeOfDeathTypes: CauseOfDeathModel[];
  productCategoryMissingConfiguration = '';

  maxTime = '';

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly claimService: ClaimCareService,
    private readonly lookupService: LookupService,
    private readonly medicalService: ICD10CodeService,
    private readonly authService: AuthService,
    private readonly dialog: MatDialog,
    public readonly datepipe: DatePipe
  ) { }


  ngOnChanges(changes: SimpleChanges): void {
    this.user = this.authService.getCurrentUser();
    this.currentUser = this.authService.getUserEmail().toLowerCase();
    this.hasBeneficiaryDetails = this.selectedPersonEvent.beneficiaries?.length > 0 ? true : false;
    this.setInjuryColor();
    this.createForm();
    this.getLookups();
  }

  getLookups() {
    if (this.selectedPersonEvent.insuranceTypeId) {
      this.getClaimTypes(this.selectedPersonEvent.insuranceTypeId, false);
    }

    this.isDiagnosticLoading$.next(true);
    forkJoin([
      this.claimService.getInsuranceTypesByEventTypeId(EventTypeEnum.Accident),
      this.medicalService.getICD10DiagonosticGroupsByEventType(EventTypeEnum.Accident),
      this.lookupService.getInjurySeverities(),
      this.lookupService.getBodySides(),
      this.claimService.getClaimBucketClasses(),
      this.claimService.GetCauseOfDeath(DeathTypeEnum.Natural)
    ]).subscribe(
      result => {
        if (result[0] && result[0].length > 0) {
          if (this.productCategoryType) {
            const insuranceTypeResults = result[0];
            if (this.productCategoryType == ProductCategoryTypeEnum.Coid) {
              const indexNOD = insuranceTypeResults.findIndex(i => i.code.toLocaleLowerCase() === 'nod');
              insuranceTypeResults.splice(indexNOD, 1);
            }
            if (this.productCategoryType == ProductCategoryTypeEnum.VapsAssistance || this.productCategoryType == ProductCategoryTypeEnum.VapsNoneStatutory) {
              const indexNOD = insuranceTypeResults.findIndex(i => i.code.toLocaleLowerCase() === 'iod');
              insuranceTypeResults.splice(indexNOD, 1);
            }

            this.insuranceTypes = insuranceTypeResults;
            this.filteredInsuranceTypes = insuranceTypeResults;
          }
          else {
            this.insuranceTypes = result[0];
            this.filteredInsuranceTypes = result[0];
          }
        }

        this.diagnosticGroups = result[1];
        this.filteredDiagnostics = result[1];
        this.drgFatal = this.diagnosticGroups.find(d => d.code === 'DRG00');
        if (this.drgFatal) {
          this.getIcd10Categories(this.drgFatal.icd10DiagnosticGroupId);
        }

        this.severities = result[2];
        this.filteredSeverities = result[2];

        this.bodySides = result[3];
        this.filteredBodySides = result[3];
        const foundBenefits = [...result[4]].filter(c=> c.name.toLocaleLowerCase() !=='pd pension' && c.name.toLocaleLowerCase() !=='pd lump') ;

        this.benefits = foundBenefits;
        this.originalBenefitList = foundBenefits;
        this.filteredBenefits = foundBenefits;

        this.causeOfDeathTypes = result[5];

        this.isDiagnosticLoading$.next(false);
        this.isLoading$.next(false);

        this.patchForm();
      }
    );
  }

  getIcd10Categories(icd10DiagnosticGroupId: number) {
    this.drg = icd10DiagnosticGroupId;
    const icdModel = new ICD10CodeEntity();
    icdModel.EventType = EventTypeEnum.Accident;
    icdModel.ICD10DiagnosticGroupId = this.drg;
    this.medicalService.getICD10CategoriesByEventTypeAndDiagnosticGroup(icdModel).subscribe(categories => {
      this.icdCategories = categories;
      this.getIcd10SubCategories(categories[this.drgIndex].icd10CategoryId);
    });
  }

  getIcd10SubCategories(icdCategoryId: number) {
    const icdModel = new ICD10CodeEntity();
    icdModel.EventType = EventTypeEnum.Accident;
    icdModel.ICD10DiagnosticGroupId = this.drg;
    icdModel.ICD10CategoryId = icdCategoryId;
    this.medicalService.getICD10SubCategoriesByEventTypeDRGAndCategory(icdModel).subscribe(subCategories => {
      this.icdSubCategories = subCategories;
      this.getIcd10Codes(subCategories[this.drgIndex].icd10SubCategoryId);
    });
  }

  getIcd10Codes(subcategoryId: number) {
    const icdModel = new ICD10CodeEntity();
    icdModel.EventType = EventTypeEnum.Accident;
    icdModel.ICD10DiagnosticGroupId = this.drg;
    icdModel.ICD10SubCategoryId = subcategoryId;
    this.medicalService.getICD10CodesByEventTypeDRGAndSubCategory(icdModel).subscribe(codes => {
      this.icdCodes = codes;
    });
  }

  createForm() {
    this.form = this.formBuilder.group({
      insuranceType: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      dateNotified: [{ value: '', disabled: this.isReadOnly }, [Validators.required, DateValidator.checkIfDateLessThan('dateNotified', this.datepipe.transform(this.eventDate, Constants.dateString))]],
      claimType: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      benefits: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      dateOfDeath: [{ value: '', disabled: this.isReadOnly }],
      certificateNumber: [{ value: '', disabled: this.isReadOnly }],
      causeOfDeath: [{ value: '', disabled: this.isReadOnly }],
      diagnostics: [{ value: '', disabled: this.isReadOnly }],
      injuryDescription: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      severity: [{ value: '', disabled: this.isReadOnly }],
      bodySide: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      atWorkPlace: [{ value: false, disabled: this.isReadOnly }],
      inScopeOfDuty: [{ value: false, disabled: this.isReadOnly }],
      denturesDamaged: [{ value: false, disabled: this.isReadOnly }],
      ledToDeath: [{ value: false, disabled: this.isReadOnly }],
      isAssault: [{ value: false, disabled: this.isReadOnly }],
      isHijack: [{ value: false, disabled: this.isReadOnly }],
      roadAccident: [{ value: false, disabled: this.isReadOnly }],
    });

    this.setValidationsForUser();

    if (this.isWizard && this.mode != ModeEnum.View) {
      this.editDetails();
    }
  }

  editOpen(): void {
    this.isReadOnly = false;
    this.form.enable();
  }

  CheckResult(listName: string) {
    switch (listName) {
      case Constants.insuranceType:
        const insuranceType = this.insuranceTypes.find(i => i.code === this.form.get('insuranceType').value);
        if (!insuranceType) {
          this.form.get('insuranceType').setValue(null);
          this.filteredInsuranceTypes = this.insuranceTypes;
        } else { this.getClaimTypes(insuranceType.parentInsuranceTypeId, true); }
        break;
      case Constants.claimType:
        this.claimType = this.claimTypes.find(c => c.name === this.form.get('claimType').value);
        if (!this.claimType) {
          this.form.get('claimType').setValue(null);
          this.filteredClaimTypes = this.claimTypes;
        } else {
          if (this.claimType.id === ClaimTypeEnum.IODCOID) {
            if (this.benefits.length > 0) {
              this.benefits = this.benefits.filter(a => a.productClass === ProductClassEnum.Statutory);
              this.filteredBenefits = this.benefits;
              this.isStatutory = true;
            }
          } else {
            this.benefits = this.originalBenefitList;
            this.filteredBenefits = this.originalBenefitList;
            this.isStatutory = false;
          }
        }
        break;
      case Constants.benefits:
        let benefit = this.benefits.find(d => d.name === this.form.get('benefits').value);
        if (!benefit) {
          this.form.get('benefits').setValue(null);
          if (this.claimType && this.claimType.id === ClaimTypeEnum.IODCOID) {
            this.benefits = this.benefits.filter(a => a.productClass === ProductClassEnum.Statutory);
            this.filteredBenefits = this.benefits;
            this.isStatutory = true;
          } else {
            this.benefits = this.originalBenefitList;
            this.filteredBenefits = this.originalBenefitList;
            this.isStatutory = false;
          }
        } else {
          if (benefit.name === this.fatal) {
            this.isFatal(true);
          } else {
            this.isFatal(false);
          }

          if (benefit.injurySeverityType > 0) {
            let type = this.severities.find(s => s.id === benefit.injurySeverityType)
            this.form.controls.severity.setValue(type.name);
            this.form.get('severity').disable();
          } else {
            this.form.get('severity').setValue(null);
            this.form.get('severity').enable();
          }
        }
        break;
      case Constants.diagnostic:
        let diagValue = null;
        let diagFormValue = this.form.get('diagnostics').value as string;
        if (diagFormValue !== null) {
          diagValue = this.diagnosticGroups.find(d => diagFormValue.includes(d.code));
          if (diagValue === undefined) {
            this.form.get('diagnostics').setValue('');
            this.filteredDiagnostics = this.diagnosticGroups;
          } else {
            this.form.patchValue({
              diagnostics: diagValue.code
            })
          }
        }
        break;
      case Constants.severity:
        let severity = this.severities.find(d => d.name === this.form.get('severity').value);
        if (severity === undefined) {
          this.form.get('severity').setValue('');
          this.filteredSeverities = this.severities;
        }
        break;
      case Constants.bodySide:
        let bodySide = this.bodySides.find(d => d.name === this.form.get('bodySide').value);
        if (bodySide === undefined) {
          this.form.get('bodySide').setValue('');
          this.filteredBodySides = this.bodySides;
        } else { };
        break;
    }
  }

  onInsuranceTypeKey(value) {
    this.filteredInsuranceTypes = this.dropDownSearch(value, 'insuranceType');
  }

  onClaimTypeKey(value) {
    this.filteredClaimTypes = this.dropDownSearch(value, 'claimType');
  }

  onBenefitsKey(value) {
    this.filteredBenefits = this.dropDownSearch(value, 'benefits');
  }

  onDiagnosticKey(value) {
    this.filteredDiagnostics = this.dropDownSearch(value, 'diagnostics');
  }

  onSeverityKey(value) {
    this.filteredSeverities = this.dropDownSearch(value, 'severity');
  }

  onBodySideKey(value) {
    this.filteredBodySides = this.dropDownSearch(value, 'bodySide');
  }

  dropDownSearch(value: string, name: string) {
    let filter = value.toLowerCase();

    switch (name) {
      case 'insuranceType':
        return this.setData(filter, this.filteredInsuranceTypes, this.insuranceTypes, 'code');
      case 'claimType':
        return this.setData(filter, this.filteredClaimTypes, this.claimTypes, 'name');
      default: break;
      case 'benefits':
        return this.setData(filter, this.filteredBenefits, this.claimTypes, 'name');
      case 'diagnostics':
        return this.setData(filter, this.filteredDiagnostics, this.diagnosticGroups, 'code');
      case 'severity':
        return this.setData(filter, this.filteredSeverities, this.severities, 'name');
      case 'bodySide':
        return this.setData(filter, this.filteredBodySides, this.bodySides, 'name');
    }
  }

  setData(filter: string, filteredList: any, originalList: any, type: any) {
    if (String.isNullOrEmpty(filter)) {
      return filteredList = originalList;
    } else {
      if (type === 'code') {
        return filteredList.filter(option => option.code.toLocaleLowerCase().includes(filter));
      }
      if (type === 'name') {
        return filteredList.filter(option => option.name.toLocaleLowerCase().includes(filter));
      }
    }
  }

  readForm() {
    if (this.selectedPersonEvent) {
      const formCheckDetails = this.form.getRawValue();
      const formDetails = this.form.getRawValue();

      this.selectedPersonEvent.personEventAccidentDetail = this.isRoadAccident ? this.selectedPersonEvent.personEventAccidentDetail ? this.selectedPersonEvent.personEventAccidentDetail : new PersonEventAccidentDetail() : null;
      this.selectedPersonEvent.physicalDamages = this.selectedPersonEvent.physicalDamages ? this.selectedPersonEvent.physicalDamages : [];

      this.addFormChecks(formDetails);
      this.addInsuranceDetails(formDetails);

      this.addNewWizardDamage(formDetails);

      this.addEditWizardDamage(formDetails);
      this.addEditWizardInjury(formDetails);

      // Death Details
      if (formCheckDetails.ledToDeath) {
        this.selectedPersonEvent.personEventDeathDetail = this.selectedPersonEvent.personEventDeathDetail ? this.selectedPersonEvent.personEventDeathDetail : new PersonEventDeathDetailModel();
        this.selectedPersonEvent.personEventDeathDetail.deathDate = new Date(formDetails.dateOfDeath);
        this.selectedPersonEvent.personEventDeathDetail.deathCertificateNo = formDetails.certificateNumber;
        this.selectedPersonEvent.personEventDeathDetail.causeOfDeathDescription = formDetails.causeOfDeath;
        this.selectedPersonEvent.personEventDeathDetail.deathType = DeathTypeEnum.Natural;
        this.selectedPersonEvent.isFatal = formCheckDetails.ledToDeath;
      }
    }
  }

  addFormChecks(formCheckDetails: any) {
    this.selectedPersonEvent.isSpectacles = false;
    this.selectedPersonEvent.isDentures = formCheckDetails.denturesDamaged ? formCheckDetails.denturesDamaged : false;
    this.selectedPersonEvent.isAssault = this.isAssault;
    this.selectedPersonEvent.isHijack = formCheckDetails.isHijack ? formCheckDetails.isHijack : false;

    if (this.isRoadAccident) {
      this.selectedPersonEvent.personEventAccidentDetail.isOccurAtNormalWorkplace = formCheckDetails.atWorkPlace ? formCheckDetails.atWorkPlace : false;
      this.selectedPersonEvent.personEventAccidentDetail.isOccurPerformingScopeofDuty = formCheckDetails.inScopeOfDuty ? formCheckDetails.inScopeOfDuty : false;
      this.selectedPersonEvent.personEventAccidentDetail.isRoadAccident = formCheckDetails.roadAccident ? formCheckDetails.roadAccident : false;
    }
  }

  addInsuranceDetails(formDetails: any) {
    this.selectedPersonEvent.physicalDamages = this.selectedPersonEvent.eventId <= 0 ? [] : this.selectedPersonEvent.physicalDamages;
    this.selectedPersonEvent.insuranceTypeId = this.insuranceTypes?.find(i => i.code === formDetails.insuranceType).parentInsuranceTypeId;
    this.selectedPersonEvent.dateCaptured = formDetails.dateNotified;
    this.selectedPersonEvent.claimType = this.claimTypes?.find(c => c.name === formDetails.claimType).id;
    this.selectedPersonEvent.personEventBucketClassId = this.benefits?.find(b => b.name === formDetails.benefits).claimBucketClassId;
    this.selectedPersonEvent.dateReceived = formDetails.dateNotified;
    this.selectedPersonEvent.createdBy = this.currentUser;
    this.selectedPersonEvent.createdDate = new Date();
    this.selectedPersonEvent.modifiedDate = new Date();
    this.selectedPersonEvent.modifiedBy = this.currentUser;
  }

  addNewWizardDamage(formDetails: any) {
    if (this.selectedPersonEvent.eventId <= 0 || !this.selectedPersonEvent.eventId) {
      const injury = new Injury();
      const damage = new PhysicalDamage();
      damage.injuries = [];

      damage.icdCategoryId = formDetails.ledToDeath ? this.icdCategories[this.drgIndex].icd10CategoryId : 1; //unknown/invalid 
      damage.icdSubCategoryId = formDetails.ledToDeath ? this.icdSubCategories[this.drgIndex].icd10SubCategoryId : 1; //unknown/invalid
      damage.description = formDetails.injuryDescription;
      damage.createdBy = this.currentUser;
      damage.createdDate = new Date();
      damage.modifiedDate = new Date();
      damage.modifiedBy = this.currentUser;

      let diagnosticGroup = this.diagnosticGroups.find(d => (formDetails.diagnostics as string).includes(d.code));
      damage.icd10DiagnosticGroupId = diagnosticGroup.icd10DiagnosticGroupId;
      this.filteredDiagnostics = this.diagnosticGroups;

      this.selectedPersonEvent.physicalDamages.push(damage);
      this.addNewWizardInjury(damage, injury, formDetails);
    }
  }

  addNewWizardInjury(damage: PhysicalDamage, injury: Injury, formDetails: any) {
    if (this.selectedPersonEvent.eventId <= 0 || !this.selectedPersonEvent.eventId) {
      injury.icd10CodeId = formDetails.ledToDeath ? this.icdCodes[this.drgIndex].icd10CodeId : 2; //unknown/invalid
      injury.bodySideAffectedType = this.bodySides.find(b => b.name === formDetails.bodySide).id;
      injury.injuryStatus = formDetails.ledToDeath ? InjuryStatusEnum.Valid : InjuryStatusEnum.NotValidated;
      injury.createdBy = this.currentUser;
      injury.createdDate = new Date();
      injury.modifiedDate = new Date();
      injury.modifiedBy = this.currentUser;
      injury.injuryRank = 1; //default rank
      injury.icd10DiagnosticGroupId = formDetails.ledToDeath ? this.diagnosticGroups.find(d => (formDetails.diagnostics as string).includes(d.code)).icd10DiagnosticGroupId : 1; //unknown/invalid
      injury.icdCategoryId = formDetails.ledToDeath ? this.icdCategories[this.drgIndex].icd10CategoryId : 1; //unknown/invalid
      injury.icdSubCategoryId = formDetails.ledToDeath ? this.icdSubCategories[this.drgIndex].icd10SubCategoryId : 1; //unknown/invalid

      let severity = this.severities.find(d => d.name === formDetails.severity)
      injury.injurySeverityType = severity.id;

      damage.injuries.push(injury);
    }
  }

  addEditWizardDamage(formDetails: any) {
    if (this.selectedPersonEvent.eventId > 0) {

      if (!this.selectedPersonEvent.physicalDamages || this.selectedPersonEvent.physicalDamages.length <= 0) {
        this.selectedPersonEvent.physicalDamages.push(new PhysicalDamage());
      }

      this.selectedPersonEvent.physicalDamages[0].icdCategoryId = formDetails.ledToDeath ? this.icdCategories[this.drgIndex].icd10CategoryId : 1;
      this.selectedPersonEvent.physicalDamages[0].icdSubCategoryId = formDetails.ledToDeath ? this.icdSubCategories[this.drgIndex].icd10SubCategoryId : 1;

      this.selectedPersonEvent.physicalDamages[0].description = formDetails.injuryDescription;
      this.selectedPersonEvent.physicalDamages[0].createdBy = this.currentUser;
      this.selectedPersonEvent.physicalDamages[0].createdDate = new Date();
      this.selectedPersonEvent.physicalDamages[0].modifiedDate = new Date();
      this.selectedPersonEvent.physicalDamages[0].modifiedBy = this.currentUser;

      let diagnosticGroup = this.diagnosticGroups.find(d => (formDetails.diagnostics as string).includes(d.code));
      this.selectedPersonEvent.physicalDamages[0].icd10DiagnosticGroupId = diagnosticGroup.icd10DiagnosticGroupId;
      this.filteredDiagnostics = this.diagnosticGroups;
    }
  }

  addEditWizardInjury(formDetails: any) {
    if (this.selectedPersonEvent.eventId > 0) {
      if (!this.selectedPersonEvent.physicalDamages[0].injuries || this.selectedPersonEvent.physicalDamages[0].injuries.length <= 0) {
        this.selectedPersonEvent.physicalDamages[0].injuries = [];
        this.selectedPersonEvent.physicalDamages[0].injuries.push(new Injury());
      }

      this.selectedPersonEvent.physicalDamages[0].injuries[0].icd10CodeId = formDetails.ledToDeath ? this.icdCodes[this.drgIndex].icd10CodeId : 2;
      this.selectedPersonEvent.physicalDamages[0].injuries[0].bodySideAffectedType = this.bodySides.find(b => b.name === formDetails.bodySide).id;
      this.selectedPersonEvent.physicalDamages[0].injuries[0].injuryStatus = formDetails.ledToDeath ? InjuryStatusEnum.Valid : InjuryStatusEnum.NotValidated;
      this.selectedPersonEvent.physicalDamages[0].injuries[0].createdBy = this.currentUser;
      this.selectedPersonEvent.physicalDamages[0].injuries[0].createdDate = new Date();
      this.selectedPersonEvent.physicalDamages[0].injuries[0].modifiedDate = new Date();
      this.selectedPersonEvent.physicalDamages[0].injuries[0].modifiedBy = this.currentUser;
      this.selectedPersonEvent.physicalDamages[0].injuries[0].icdCategoryId = formDetails.ledToDeath ? this.icdCategories[this.drgIndex].icd10CategoryId : 1;
      this.selectedPersonEvent.physicalDamages[0].injuries[0].icdSubCategoryId = formDetails.ledToDeath ? this.icdSubCategories[this.drgIndex].icd10SubCategoryId : 1;

      let severity = this.severities.find(d => d.name === formDetails.severity)
      this.selectedPersonEvent.physicalDamages[0].injuries[0].injurySeverityType = severity.id;

      let diagnosticGroup = this.diagnosticGroups.find(d => (formDetails.diagnostics as string).includes(d.code));
      this.selectedPersonEvent.physicalDamages[0].injuries[0].icd10DiagnosticGroupId = diagnosticGroup.icd10DiagnosticGroupId;
      this.filteredDiagnostics = this.diagnosticGroups;
    }
  }

  patchForm() {
    if (this.selectedPersonEvent) {
      if (this.selectedPersonEvent.personEventAccidentDetail) {
        this.isRoadAccident = this.selectedPersonEvent.personEventAccidentDetail.isRoadAccident;
      }

      this.isAssault = this.selectedPersonEvent.isAssault;

      this.patchFormCheckControls();
      this.patchFormControls();
    }
  }

  patchFormCheckControls() {
    this.form.patchValue({
      denturesDamaged: this.selectedPersonEvent?.isDentures ? this.selectedPersonEvent.isDentures : false,
      isAssault: this.selectedPersonEvent.isAssault ? this.selectedPersonEvent.isAssault : false,
      isHijack: this.selectedPersonEvent.isHijack ? this.selectedPersonEvent.isHijack : false,

      atWorkPlace: this.selectedPersonEvent?.personEventAccidentDetail?.isOccurAtNormalWorkplace ? this.selectedPersonEvent.personEventAccidentDetail.isOccurAtNormalWorkplace : false,
      inScopeOfDuty: this.selectedPersonEvent?.personEventAccidentDetail?.isOccurPerformingScopeofDuty ? this.selectedPersonEvent.personEventAccidentDetail.isOccurPerformingScopeofDuty : false,
      roadAccident: this.selectedPersonEvent?.personEventAccidentDetail?.isRoadAccident ? this.selectedPersonEvent.personEventAccidentDetail.isRoadAccident : false,
    });
  }

  patchFormControls() {
    let diag = null;

    if (this.selectedPersonEvent.physicalDamages && this.selectedPersonEvent.physicalDamages[0]?.icd10DiagnosticGroupId > 0) {
      let diagnostic = this.diagnosticGroups.find(d => d.icd10DiagnosticGroupId === this.selectedPersonEvent.physicalDamages[0].icd10DiagnosticGroupId);
      diag = diagnostic.code;
    }

    let bodySide = this.selectedPersonEvent.physicalDamages ? this.bodySides?.find(b => b.id === this.selectedPersonEvent.physicalDamages[0]?.injuries[0]?.bodySideAffectedType)?.name : null;
    let insuranceType = this.insuranceTypes.find(i => i.parentInsuranceTypeId === this.selectedPersonEvent.insuranceTypeId)?.code;
    let benefits = this.benefits?.find(b => b.claimBucketClassId === this.selectedPersonEvent.personEventBucketClassId)?.name;

    const claimType = this.claimTypes?.find(c => c.id === this.selectedPersonEvent.claimType);

    if (this.selectedPersonEvent.claimType === ClaimTypeEnum.IODCOID) {
      this.filteredBenefits = this.benefits.filter(a => a.productClass === ProductClassEnum.Statutory);
    }

    this.form.patchValue({
      severity: this.selectedPersonEvent.physicalDamages ? this.severities.find(d => d.id === this.selectedPersonEvent.physicalDamages[0]?.injuries[0]?.injurySeverityType)?.name : null,
      diagnostics: diag,
      bodySide: bodySide,
      insuranceType: insuranceType,
      benefits: benefits,
      claimType: claimType ? claimType.name : this.form.controls.claimType.reset(),
      dateNotified: this.selectedPersonEvent.dateCaptured ? this.selectedPersonEvent.dateCaptured : new Date(),
      dateOfDeath: this.selectedPersonEvent.personEventDeathDetail ? this.selectedPersonEvent.personEventDeathDetail.deathDate : null,
      certificateNumber: this.selectedPersonEvent.personEventDeathDetail ? this.selectedPersonEvent.personEventDeathDetail.deathCertificateNo : null,
      causeOfDeath: this.selectedPersonEvent.personEventDeathDetail ? this.selectedPersonEvent.personEventDeathDetail.causeOfDeathDescription : null,
      injuryDescription: this.selectedPersonEvent.physicalDamages ? this.selectedPersonEvent.physicalDamages[0]?.description : null,
    });

    if (this.selectedPersonEvent.insuranceTypeId) {
      this.getClaimTypes(this.selectedPersonEvent.insuranceTypeId, false);
    }

    if (this.selectedPersonEvent.personEventDeathDetail) {
      this.ledToDeath = true;
      this.form.patchValue({
        ledToDeath: true
      });
    }
  }

  getClaimTypes(insuranceType: number, enable: boolean) {
    this.isClaimTypeLoading$.next(true);
    this.form.get('claimType').setErrors(null);
    if (this.productCategoryType) {
      this.lookupService.getClaimTypesByEventAndProductCategory(this.eventType, insuranceType, +this.productCategoryType).subscribe(claimTypes => {
        if (claimTypes && claimTypes.length > 0) {
          this.claimTypes = [...claimTypes];
          this.filteredClaimTypes = [...claimTypes];
          if (enable) this.form.controls.claimType.enable();
        }
        else {
          this.productCategoryMissingConfiguration = this.formatCamelCase(ProductCategoryTypeEnum[this.productCategoryType]);
          this.form.get('claimType').setErrors({ notConfigured: true });
        }
        this.isClaimTypeLoading$.next(false);
      }
      );
    }
    else {
      this.lookupService.getClaimTypesByEventAndParentInsuranceType(this.eventType, insuranceType).subscribe(claimTypes => {
        this.claimTypes = claimTypes;
        this.filteredClaimTypes = claimTypes;
        this.isClaimTypeLoading$.next(false);

        if (enable) { this.form.controls.claimType.enable(); }
      });
    }
  }

  checkPermissions(permission: string): boolean {
    return userUtility.hasPermission(permission);
  }

  ledToDeathChange($event: any) {
    this.isFatal($event.checked);
    if ($event.checked) {
      this.disableFormControl('benefits');
      this.isAssault = false;
      this.form.get('isAssault').setValue(false);
    } else {
      this.form.patchValue({
        benefits: null
      });
      this.enableFormControl('benefits');
    }
  }

  setInjuryColor() {
    this.isInjuryDetails = this.selectedPersonEvent && this.selectedPersonEvent.personEventAccidentDetail ? true : false;
  }

  setValidationsForUser() {
    const validators = [Validators.required];
    this.applyValidationToFormControl(this.form, validators, 'diagnostics');
    this.applyValidationToFormControl(this.form, validators, 'severity');
    this.applyValidationToFormControl(this.form, validators, 'injuryDescription');
  }

  viewInsuranceDetail(personEvent: PersonEventModel) {
    this.viewInsuranceDetails = true;
    this.selectedPersonEvent = personEvent;
  }

  clearValidationToFormControl(form: UntypedFormGroup, controlName: string) {
    form.get(controlName).clearValidators();
    form.get(controlName).markAsTouched();
    form.get(controlName).updateValueAndValidity();
  }

  applyValidationToFormControl(form: UntypedFormGroup, validationToApply: any, controlName: string) {
    form.get(controlName).setValidators(validationToApply);
    form.get(controlName).markAsTouched();
    form.get(controlName).updateValueAndValidity();
  }

  resetForm() {
    this.form.disable();
  }

  validateTimeAndDate() {
    const today = new Date();
    const todayDate = this.datepipe.transform(today, Constants.dateString);
    this.maxTime = this.datepipe.transform(today, Constants.time24HRString);
    const formModel = this.form.getRawValue();
    if (formModel.dateOfAccident && formModel.timeOfEvent) {
      const startDateString = this.datepipe.transform(formModel.dateOfAccident, Constants.dateString);
      if (startDateString === todayDate) {
        if (formModel.timeOfEvent > this.maxTime) {
          this.form.get('timeOfEvent').setValidators([Validators.required, TimeValidators.isTimeBefore(this.maxTime)]);
          this.form.get('timeOfEvent').updateValueAndValidity();
        } else {
          this.form.get('timeOfEvent').setValidators([Validators.required]);
          this.form.get('timeOfEvent').updateValueAndValidity();
        }
      } else {
        this.form.get('timeOfEvent').setValidators([Validators.required]);
        this.form.get('timeOfEvent').updateValueAndValidity();
      }
    }
  }
  save() {
    this.isSaving$.next(true);
    this.readForm();
    this.resetForm();
    this.cancel();
    this.isSaving$.next(false);
  }

  disableFormControl(controlName: string) {
    if (this.form.controls[controlName]) {
      this.form.get(controlName).disable();
    } else {
      this.form.get(controlName).disable();
    }
  }

  enableFormControl(controlName: string) {
    if (this.form.controls[controlName]) {
      this.form.get(controlName).enable();
    } else {
      this.form.get(controlName).enable();
    }
  }

  isFatal(ledToDeathChecked: boolean) {
    this.ledToDeath = ledToDeathChecked;
    this.form.get('ledToDeath').setValue(this.ledToDeath);
    if (ledToDeathChecked) {
      this.diagnosticGroups.push(this.drgFatal);
      this.disableICD();
      const benefit = this.benefits.find(b => b.name === this.fatal);
      if (this.diagnosticGroups.length > 0) {
        const drg00 = this.diagnosticGroups.find(d => d.code === 'DRG00');

        this.form.patchValue({
          benefits: benefit.name,
          diagnostics: drg00.code,
          diagnosticsNotCapturer: drg00.code
        });
        this.disableFormControl('diagnostics');

        const causeOfDeathValidators = [Validators.minLength(5), Validators.maxLength(260)];
        const dateOfDeathValidators = [Validators.required, DateValidator.checkIfDateLessThan('dateOfDeath', this.datepipe.transform(this.eventDate, Constants.dateString))];
        this.applyValidationToFormControl(this.form, dateOfDeathValidators, 'dateOfDeath');
        this.applyValidationToFormControl(this.form, causeOfDeathValidators, 'causeOfDeath');

        let type = this.severities.find(s => s.id === InjurySeverityTypeEnum.Severe)
        this.form.patchValue({
          severity: type.name,
        });
        this.form.get('severity').disable();
      }

    } else {
      const index = this.diagnosticGroups.indexOf(this.drgFatal);
      this.diagnosticGroups.splice(index, 1);

      this.form.patchValue({
        dateOfDeath: null,
        certificateNumber: null,
        causeOfDeath: null,
      });
      this.disableICD();
      this.enableFormControl('diagnostics');
      this.enableFormControl('benefits');
      this.clearValidationToFormControl(this.form, 'dateOfDeath');
      this.clearValidationToFormControl(this.form, 'certificateNumber');
      this.clearValidationToFormControl(this.form, 'causeOfDeath');
    }
  }

  disableICD() {
    this.form.patchValue({
      diagnostics: null,
      codeCategory: null,
      subCategory: null,
      icdCode: null,
    });
  }

  isRoadAccidentChange($event: any) {
    this.isRoadAccident = $event.checked;
    if (this.isRoadAccident) {
      this.form.get('isAssault').setValue(false);
      this.form.get('isHijack').setValue(false);
      this.isAssault = false;
    }
  }

  isAssaultChange($event: any) {
    this.isAssault = $event.checked;
    if (this.isAssault) {
      this.form.get('roadAccident').setValue(false);
      this.isRoadAccident = false;
    }
  }

  denturesDamagedChange($event: any) {
    var denturesDamaged = $event.checked;
    if (denturesDamaged) {
      this.isAssault = false;
      this.form.get('isAssault').setValue(false);
    }
  }

  inScopeOfDutyChange($event: any) {
    var inScopeOfDuty = $event.checked;
    if (inScopeOfDuty) {
      this.isAssault = false;
      this.form.get('isAssault').setValue(false);
    }
  }

  atWorkPlaceChange($event: any) {
    var atWorkPlace = $event.checked;
    if (atWorkPlace) {
      this.isAssault = false;
      this.form.get('isAssault').setValue(false);
    }
  }

  isHijackChange($event: any) {
    const isHijack = $event.checked;
    if (isHijack) {
      this.form.get('roadAccident').setValue(false);
      this.form.get('isAssault').setValue(false);
      this.isRoadAccident = false;
      this.isAssault = false;
    }
  }

  onCalloutChange(): void {
    const formDetails = this.form.getRawValue();
    const onCallout = formDetails.onCallout;
    if (onCallout) {
      this.form.get('onStandBy').setValue(false);
    }
  }

  onStandByChange(): void {
    const formDetails = this.form.getRawValue();
    const onStandBy = formDetails.onStandBy;
    if (onStandBy) {
      this.form.get('onCallout').setValue(false);
    }
  }

  onPublicRoadChange(): void {
    const formDetails = this.form.getRawValue();
    const onPublicRoad = formDetails.onPublicRoad;
    if (onPublicRoad) {
      this.form.get('onPrivateRoad').setValue(false);
    }
  }

  onPrivateRoadChange(): void {
    const formDetails = this.form.getRawValue();
    const onPrivateRoad = formDetails.onPrivateRoad;
    if (onPrivateRoad) {
      this.form.get('onPublicRoad').setValue(false);
    }
  }

  addBeneficiary(): void {
    const dialogRef = this.dialog.open(HolisticBeneficiaryContainerComponent, {
      width: '1200px',
      maxHeight: '600px',
      data: {
        beneficiary: new RolePlayer(),
        personEvent: this.selectedPersonEvent,
        isReadOnly: false,
        isWizard: this.isWizard,
        mode: ModeEnum.NewBeneficiary,
        isEdit: false,
      }
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.selectedPersonEvent.beneficiaries = new Array();
        this.selectedPersonEvent.beneficiaries.push(data);
        this.hasBeneficiaryDetails = true;

        this.form.markAsDirty();
        this.form.updateValueAndValidity();
      }
    });
  }

  openBeneficiaryDialogView(menu: any, item: RolePlayer): void {
    const type = menu;
    const dialogRef = this.dialog.open(HolisticBeneficiaryContainerComponent, {
      width: '1200px',
      maxHeight: '600px',
      data: {
        beneficiary: item,
        personEvent: this.selectedPersonEvent,
        isReadOnly: false,
        isWizard: this.isWizard,
        isEdit: true,
      }
    });
    if (type === 'edit') {
      dialogRef.afterClosed().subscribe(data => {
        if (data) {
          this.selectedPersonEvent.beneficiaries = data.beneficiaries;
          this.hasBeneficiaryDetails = true;
        }
      });
    }
  }

  closeView() {
    this.viewInsuranceDetails = !this.viewInsuranceDetails;
  }

  cancel() {
    this.isReadOnly = true;
    this.form.disable();
    this.addPersonEvent.emit(this.selectedPersonEvent);
  }

  editDetails() {
    this.form.enable();
    this.isReadOnly = false;
    if (this.selectedPersonEvent.rolePlayer && this.selectedPersonEvent.rolePlayer.rolePlayerId && this.selectedPersonEvent.rolePlayer.rolePlayerId > 0) {
      this.form.controls.claimType.disable();
    }
  }

  formatCamelCase(property): string {
    return property.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  }
}
