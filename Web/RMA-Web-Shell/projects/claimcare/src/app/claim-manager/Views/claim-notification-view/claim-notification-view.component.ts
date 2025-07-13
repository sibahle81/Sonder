import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { EventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/event.model';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';
import { Company } from 'projects/clientcare/src/app/policy-manager/shared/entities/company';
import { PersonEmployment } from 'projects/clientcare/src/app/policy-manager/shared/entities/person-employment';
import { RolePlayerAddress } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-address';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { IdTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/idTypeEnum';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { ICD10DiagnosticGroup } from 'projects/medicare/src/app/medi-manager/models/icd10-diagnostic-group';
import { AddressTypeEnum } from 'projects/shared-models-lib/src/lib/enums/address-type-enum';
import { BodySideAffectedTypeEnum } from 'projects/shared-models-lib/src/lib/enums/body-side-affected-type-enum';
import { ClaimLiabilityStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-liability-status.enum';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { CommunicationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/communication-type-enum';
import { GenderEnum } from 'projects/shared-models-lib/src/lib/enums/gender-enum';
import { MaritalStatusEnum } from 'projects/shared-models-lib/src/lib/enums/marital-status-enum';
import { NationalityEnum } from 'projects/shared-models-lib/src/lib/enums/nationality-enum';
import { STPExitReasonEnum } from 'projects/shared-models-lib/src/lib/enums/stp-exit-reason.enum';
import { SuspiciousTransactionStatusEnum } from 'projects/shared-models-lib/src/lib/enums/suspicious-transaction-status-enum';
import { TitleEnum } from 'projects/shared-models-lib/src/lib/enums/title-enum';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Subscription } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { ParentInsuranceType } from '../../shared/entities/parentInsuranceType';
import { PatersonGrading } from '../../shared/entities/paterson-grading';
import { ClaimBucketClassModel } from '../../shared/entities/personEvent/claimBucketClass.model';
import { EventTypeEnum } from '../../shared/enums/event-type-enum';
import { InjurySeverityTypeEnum } from '../../shared/enums/injury-severity-type-enum';
import { ICD10CodeService } from 'projects/medicare/src/app/medi-manager/services/icd10-code-service';
import { ICD10Code } from 'projects/medicare/src/app/medi-manager/models/icd10-code';
import { RolePlayerContact } from 'projects/clientcare/src/app/member-manager/models/roleplayer-contact';
import { ContactInformationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/contact-information-type-enum';
import { ContactDesignationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/contact-designation-type-enum';
import { DiseaseType } from '../../shared/entities/diseaseType';
import { EventCause } from '../../shared/entities/eventCause';
import { ICD10Category } from 'projects/medicare/src/app/medi-manager/models/icd10-category';
import { ICD10SubCategory } from 'projects/medicare/src/app/medi-manager/models/icd10-sub-category';
import { ICD10CodeEntity } from '../../shared/entities/icd10-code-model';
import { RolePlayerRelation } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer-relation';
import { ManageBeneficiaryComponent } from '../manage-beneficiary/manage-beneficiary.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { ClientVopdResponse } from 'projects/clientcare/src/app/policy-manager/shared/entities/vopd-response';
import { VopdStatusEnum } from '../../../../../../clientcare/src/app/policy-manager/shared/enums/vopd-status.enum';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Constants } from '../../../constants';
import { RolePlayerBenefitWaitingPeriodEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/roleplayer-benefit-waiting-period.enum';
import { MedicalInvoicesListComponent } from 'projects/shared-components-lib/src/lib/medical-invoices-list/medical-invoices-list.component';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';
import { MarriageTypeEnum } from 'projects/shared-models-lib/src/lib/enums/marriage-type-num';
import { BeneficiaryTypeEnum } from '../../../../../../shared-models-lib/src/lib/enums/beneficiary-type-enum';

@Component({
  selector: 'claim-notification-view',
  templateUrl: './claim-notification-view.component.html',
  styleUrls: ['./claim-notification-view.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('isExpanded', style({ height: '*', visibility: 'visible' })),
      transition('isExpanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ClaimNotificationViewComponent implements OnInit, OnDestroy {
  public event = new EventModel();
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public showAccidentDetails = false;

  public isPotentialSTP: boolean;
  public suspiciousTransactionStatus: string;
  public claimStatus: number;
  public liabailityStatus: string;
  public stpExitReason: string;

  public claimantDetails = new RolePlayer();
  public subsidiaries: Company[] = [];
  public personEmployment: PersonEmployment;
  public personRoleplayerAddresses: RolePlayerAddress[]=[];
  public countries : Lookup[] = [];
  public claimTypes : Lookup[] = [];
  public patersonGradings : PatersonGrading[] = [];
  public parentInsuranceTypes: ParentInsuranceType[] = [];
  public benefits: ClaimBucketClassModel[] = [];
  public locationCategories: Lookup[] = [];
  public diagnosticGroups: ICD10DiagnosticGroup[] = [];
  public icdCategories: ICD10Category[] = [];
  public icdSubCategories: ICD10SubCategory[] = [];
  public icd10Codes: ICD10Code[] = [];
  public rolePlayerContacts: RolePlayerContact[] = [];
  public occupationYears: number;
  public monthsInOccupation: number;
  public daysInOccupation: number;
  public personEventId: number;

  public typeOfDiseases: DiseaseType[] = [];
  public causeOfDiseases: EventCause[] = [];

  public beneficiaries: RolePlayer[] = [];
  public showDocuments: boolean;
  public showNotes: boolean;
  public showRequirements: boolean;


  public isMemberDetailsLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public isSubsidiariesLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public isPersonEmploymentDetailsLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public isICD10CodeLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public isLoadingContacts$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public isBeneficiariesLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public beneficiariesDataSource: RolePlayer[] = [];
  @ViewChild(MatTable) beneficiariesTable: MatTable<RolePlayer>;
  hasBeneficiaryData = false;
  isAddBeneficiary = false;
  menus: { title: string, action: string, disable: boolean }[];
  displayedColumnsBeneficiary: string[] = ['expand','beneficiaryName', 'beneficiaryLastName', 'idNumber','vopdStatus','isVopdVerified', 'actions'];
  showEarnings: boolean = false;
  isSpouse = false;
  protected unsubscribe: Subscription[] = [];

  constructor(
    private readonly claimService: ClaimCareService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly alertService: AlertService,
    private readonly memberService: MemberService,
    private readonly rolePlayerService: RolePlayerService,
    private readonly lookUpService: LookupService,
    private readonly dialog: MatDialog,
    private readonly confirmservice: ConfirmationDialogsService,
    private readonly medicalService: ICD10CodeService
  ) { }

  public ngOnInit(): void {
    this.isLoading$.next(true);
    this.isPersonEmploymentDetailsLoading$.next(true)
    this.getClaimTypes();
    this.getCountries();
    this.getInsuranceTypes();
    this.getClaimBucketClasses();
    this.getLocationCategories()
    this.loadNotificationDetails();
  }

  loadNotificationDetails() {
    this.activatedRoute.params.subscribe(params => {
      let sub = this.claimService.getPersonEventDetails(params.personEventId)
        .subscribe(result => {
          this.event = result;
          this.personEventId = this.event.personEvents[0].personEventId;
          this.getDiagnosticGroupsByEventTypeId(result.eventType);
          this.getMemberDetails();
          this.getRolePlayerContactInformation();
          this.event.isRolePlayerContactConfirmed = true;
          this.getBeneficiaries(this.event.personEvents[0].rolePlayer.toRolePlayers);
          if (this.event.personEvents[0].personEventStpExitReasons.length !== 0) {
            this.stpExitReason = this.getSTPExitReason(this.event.personEvents[0].personEventStpExitReasons[this.event.personEvents[0].personEventStpExitReasons.length - 1].stpExitReasonId);
          }
          this.isPotentialSTP = this.event.personEvents[0].isStraightThroughProcess;
          if(result.eventType === EventTypeEnum.Accident){
            this.isAddBeneficiary = this.event.personEvents[0].personEventDeathDetail != null ? true : false;
          }
          if(result.eventType === EventTypeEnum.Disease) {
            if((this.event.personEvents.length > 0) && (this.event.personEvents[0].physicalDamages.length > 0)){
              this.isAddBeneficiary = this.event.personEvents[0].physicalDamages[0].icd10DiagnosticGroupId === Constants.ICD10CodeDiseaseFatalDRG ? true : false;
            }
          }
          if (this.event.personEvents[0].claims.length !== 0) {
            this.claimStatus = this.event.personEvents[0].claims[0].claimStatus;
            if (this.event.personEvents[0].claims[0].claimLiabilityStatus) {
              this.liabailityStatus = this.getLiabilityStatus(this.event.personEvents[0].claims[0].claimLiabilityStatus);
            }
          }
          this.suspiciousTransactionStatus = this.getSuspiciousTransactionStatus(this.event.personEvents[0].suspiciousTransactionStatus);
          this.showAccidentDetails = result.eventType === EventTypeEnum.Accident;
          if(this.event.personEvents[0].rolePlayer.rolePlayerAddresses.length == 0){
            this.personRoleplayerAddresses = [];
          } else {
            this.personRoleplayerAddresses = this.event.personEvents[0].rolePlayer.rolePlayerAddresses;
          }
          let icd10CodeIds = "";
          if(result.personEvents[0].physicalDamages.length != 0){
            if(result.personEvents[0].physicalDamages[0].injuries.length != 0) {
              result.personEvents[0].physicalDamages[0].injuries.forEach(a => {
                icd10CodeIds = icd10CodeIds + (icd10CodeIds.length > 0 ? `, ${a.icd10CodeId}` : a.icd10CodeId)
              });
              this.getICD10Codes(icd10CodeIds);
            }
          }

          if (this.event.personEvents[0].physicalDamages && !this.showAccidentDetails) {

            this.getCausesOfDisease(this.event.personEvents[0].personEventDiseaseDetail.typeOfDiseaseId);
            this.getTypeOfDiseases(this.event.personEvents[0].insuranceTypeId);

            if (this.event.personEvents[0].physicalDamages[0].icd10DiagnosticGroupId > 0) {
              this.getIcdCategories(this.event.personEvents[0].physicalDamages[0].icd10DiagnosticGroupId);
            }
            if (this.event.personEvents[0].physicalDamages[0].icdCategoryId > 0) {
              this.getIcdSubCategories(this.event.personEvents[0].physicalDamages[0].icdCategoryId, this.event.personEvents[0].physicalDamages[0].icd10DiagnosticGroupId);
            }
          }

          this.getPersonEmploymentDetails(result.personEvents[0].rolePlayer.rolePlayerId, result.rolePlayerId);
          this.isLoading$.next(false);
        },
          (error) => {
            this.alertService.error(error);
            this.isLoading$.next(false);
          });
      this.unsubscribe.push(sub);
    });
  }

  public reloadAfterFinalMedicalReport(event: any):void {
    this.loadNotificationDetails();
  }

  public ngOnDestroy(): void {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  public back(): void {
    this.router.navigateByUrl('/claimcare/claim-manager/person-event-search');
  }

  getSuspiciousTransactionStatus(id: number) {
    return this.format(SuspiciousTransactionStatusEnum[id]);
  }

  getLiabilityStatus(id: number) {
    return this.format(ClaimLiabilityStatusEnum[id]);
  }

  getSTPExitReason(id: number) {
    return this.format(STPExitReasonEnum[id]);
  }

  getClaimStatus(id: number) {
    return this.format(ClaimStatusEnum[id]);
  }

  getTitle(id: number) {
    return this.format(TitleEnum[id]);
  }

  getIDType(id: number) {
    return this.format(IdTypeEnum[id]);
  }

  getCommunicationType(id: number) {
    return this.format(CommunicationTypeEnum[id]);
  }

  getGender(id: number) {
    return this.format(GenderEnum[id]);
  }

  getVOPDStatus(id: number) {
    if(id > 0)
    {
      return this.format(VopdStatusEnum[id]);
    }
  }

  getMaritalStatus(id: number) {
    return this.format(MaritalStatusEnum[id]);
  }

  getNationality(id: number) {
    return this.format(NationalityEnum[id]);
  }

  getInjurySeverity(id: number) {
    return this.format(InjurySeverityTypeEnum[id]);
  }

  getBodySide(id: number) {
    return this.format(BodySideAffectedTypeEnum[id]);
  }

  getContactDesignation(id: number) {
    return this.format(ContactDesignationTypeEnum[id]);
  }

  getRolePlayerMedicalWaiting(): string {
    let rolePlayerBenefitWaitingPeriod = this.claimantDetails.rolePlayerBenefitWaitingPeriod;
    if(!rolePlayerBenefitWaitingPeriod)
      return 'No Medical Waiting Period Defined';
    return this.format(RolePlayerBenefitWaitingPeriodEnum[rolePlayerBenefitWaitingPeriod]);
  }

  getCountry(id: number) {
    if(this.countries.length != 0){
      var country = this.countries.find(a => a.id === id);
      return country ? country.name: '';
    }
  }

  getCountries() {
    let sub =this.lookUpService.getCountries().subscribe(results => {
      this.countries = results;
    })
    this.unsubscribe.push(sub);
  }

  getPatersonGradings(isSkilled: boolean) {
    let sub =this.claimService.getPatersonGradingsBySkill(isSkilled).subscribe(results => {
      this.patersonGradings = results;
    })
    this.unsubscribe.push(sub);
  }

  getPatersonGrading(id: number) {
    if(this.patersonGradings.length != 0){
      var patersonGrading = this.patersonGradings.find(a => a.patersonGradingId === id);
      return patersonGrading ? patersonGrading.code + ' - ' + patersonGrading.description: '';
    }
  }

  getClaimTypes() {
    let sub = this.lookUpService.getClaimTypes().subscribe(results => {
      this.claimTypes = results;
    })
    this.unsubscribe.push(sub);
  }

  getClaimType(id: number) {
    if(this.claimTypes.length != 0){
      var claimType = this.claimTypes.find(a => a.id === id);
      return claimType ? claimType.name: '';
    }
  }

  getInsuranceTypes() {
    let sub = this.claimService.getInsuranceTypes().subscribe(results => {
      this.parentInsuranceTypes = results;
    })
    this.unsubscribe.push(sub);
  }

  getInsuranceType(id: number) {
    if(this.parentInsuranceTypes.length != 0){
      var parentInsuranceType = this.parentInsuranceTypes.find(a => a.parentInsuranceTypeId === id);
      return parentInsuranceType ? parentInsuranceType.code + ' - ' + parentInsuranceType.description: '';
    }
  }

  getClaimBucketClasses() {
    let sub = this.claimService.getClaimBucketClasses().subscribe(results => {
      this.benefits = results;
    })
    this.unsubscribe.push(sub);
  }

  getClaimBucketClass(id: number) {
    if(this.benefits.length != 0){
      var benefit = this.benefits.find(a => a.claimBucketClassId === id);
      return benefit ? benefit.name: '';
    }
  }

  getLocationCategories(): void {
    let sub = this.lookUpService.getLocationCategories().subscribe(data => {
      this.locationCategories = data;
    });
    this.unsubscribe.push(sub);
  }

  getLocationCategory(id: number) {
    if(this.locationCategories.length != 0){
      var locationCategory = this.locationCategories.find(a => a.id === id);
      return locationCategory ? locationCategory.name: '';
    }
  }

  getTypeOfDiseases(insuranceTypeId: number) {
    let sub = this.claimService.getTypeOfDiseasesByInsuranceTypeId(insuranceTypeId).subscribe(types => {
      this.typeOfDiseases = types;
    });
    this.unsubscribe.push(sub);
  }

  getTypeOfDisease(id: number){
    if(this.typeOfDiseases.length != 0){
      var typeOfDisease = this.typeOfDiseases.find(a => a.diseaseTypeId === id);
      return typeOfDisease ? typeOfDisease.name : '';
    }
  }

  getCausesOfDisease(diseaseTypeId: number) {
    let sub = this.claimService.getCausesOfDiseases(diseaseTypeId).subscribe(causes => {
      this.causeOfDiseases = causes;
    });
    this.unsubscribe.push(sub);
  }

  getCauseOfDiease(id: number) {
    if(this.causeOfDiseases.length != 0) {
      var causeOfDisease = this.causeOfDiseases.find(a => a.eventCauseId === id);
      return causeOfDisease ? causeOfDisease.name : '';
    }
  }

  format(text: string) {
    if(text){
      const status = text.replace(/([A-Z])/g, '$1').trim();
      return status.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+/g).join(' ');
    }
  }

  getMemberDetails() {
    this.isMemberDetailsLoading$.next(true);
    let sub = this.rolePlayerService.getRolePlayer(this.event.rolePlayerId).subscribe(rolePlayer => {
      if (rolePlayer) {
        this.claimantDetails = rolePlayer;
        this.getSubsidiaries();
      }
      this.isMemberDetailsLoading$.next(false);
    }, error => {
      this.isMemberDetailsLoading$.next(false);
    });
    this.unsubscribe.push(sub);
  }

  expandCollapse(row) {
    if (row.isExpanded) {
      row.isExpanded = false;
    } else {
      row.isExpanded = true;
    }
  }

  getBeneficiaries(rolePlayerRelations: RolePlayerRelation[]){
    if(rolePlayerRelations.length > 0){
      this.isBeneficiariesLoading$.next(true);
      rolePlayerRelations.forEach(rolePlayerRelation => {
        let sub = this.rolePlayerService.getRolePlayer(rolePlayerRelation.fromRolePlayerId).subscribe(beneficiary =>{
          if(beneficiary.fromRolePlayers[0].rolePlayerTypeId === BeneficiaryTypeEnum.Spouse && (beneficiary.person.marriageType == MarriageTypeEnum.CivilMarriage || beneficiary.person.marriageType == MarriageTypeEnum.CivilUnion)){
            this.isSpouse = true;
          }
          this.runBeneficiaryVopdValidation(beneficiary);
          let sub2 = this.rolePlayerService.getVOPDResponseResultByRoleplayerId(rolePlayerRelation.fromRolePlayerId).subscribe(clientVopdResponse=>{
          beneficiary.clientVopdResponse = clientVopdResponse;
          if(beneficiary.clientVopdResponse !== null){
            beneficiary.person.vopdVerifiedDescription = beneficiary.person.isVopdVerified ? 'Verified' : 'Not Verified';
          }else{
            beneficiary.person.vopdVerifiedDescription = 'Not Applicable';
          }
          this.beneficiaries.push(beneficiary);
          this.beneficiariesDataSource.push(beneficiary);
          this.updateBeneficiaryTable();
          this.hasBeneficiaryData = true;
          });
          this.unsubscribe.push(sub2);
        })
        this.unsubscribe.push(sub);
      });
      this.isBeneficiariesLoading$.next(false);
    }
  }

  runBeneficiaryVopdValidation(rolePlayer: RolePlayer){
    if(rolePlayer != null){
      if(rolePlayer.person.idType === IdTypeEnum.SA_ID_Document){
        let sub = this.claimService.processBeneficiaryVopd(rolePlayer.rolePlayerId).subscribe(res =>{
        })
        this.unsubscribe.push(sub);
      }
    }
  }

  getVOPDResponse(rolePlayerId: number) : ClientVopdResponse {
    var clientVopdResponse = new ClientVopdResponse();
    let sub = this.rolePlayerService.getVOPDResponseResultByRoleplayerId(rolePlayerId).subscribe(res=>{
      clientVopdResponse = res;
    });
    this.unsubscribe.push(sub);
    return clientVopdResponse;
  }

  getSubsidiaries() {
    this.isSubsidiariesLoading$.next(true);
    let sub = this.memberService.getSubsidiaries(this.event.rolePlayerId).subscribe(result => {
      if (result.length > 0) {
        this.subsidiaries = result;
      } else {
        this.subsidiaries = [];
        this.subsidiaries.push(this.claimantDetails.company);
      }
      this.isSubsidiariesLoading$.next(false);
    }, error => {
      this.isSubsidiariesLoading$.next(false);
    });
    this.unsubscribe.push(sub);
  }

  getRolePlayerContactInformation() {
    this.isLoadingContacts$.next(true);
    let sub = this.rolePlayerService.getRolePlayerContactInformation(this.event.rolePlayerId).subscribe(results => {
      if (results.length > 0) {
        results.forEach(rolePlayerContact => {
          if (rolePlayerContact.rolePlayerContactInformations.length > 0) {
            const roleplayerContactDetails = rolePlayerContact.rolePlayerContactInformations.find(b => b.contactInformationType === ContactInformationTypeEnum.Claims);
            if (roleplayerContactDetails) {
              this.rolePlayerContacts.push(rolePlayerContact);
            }
          }
        });
      }
      this.isLoadingContacts$.next(false);
    }, error => {
      this.isLoadingContacts$.next(false);
    });
    this.unsubscribe.push(sub);
  }

  getMemberSite(id: number) {
    if(this.subsidiaries.length != 0){
      var memberSite = this.subsidiaries.find(a => a.rolePlayerId === id)
      return memberSite ? memberSite.name : '';
    }
  }

  getPersonEmploymentDetails(employeeRoleplayerId: number, employerRolePlayerId: number) {
    this.isPersonEmploymentDetailsLoading$.next(true);
    let sub = this.rolePlayerService.getPersonEmployment(employeeRoleplayerId, employerRolePlayerId).subscribe(result => {
      if (result) {
        this.personEmployment = result;
        this.doOccupationValidation(result.startDate);
        this.getPatersonGradings(result.isSkilled);
      }
      this.isPersonEmploymentDetailsLoading$.next(false);
    });
    this.unsubscribe.push(sub);
  }

  getType(id: number) {
    const addresstype = AddressTypeEnum[id];
    return addresstype;
  }

  getDiagnosticGroupsByEventTypeId(eventType: EventTypeEnum) {
    let sub = this.medicalService.getICD10DiagonosticGroupsByEventType(eventType).subscribe(groups => {
      this.diagnosticGroups = groups;
    });
    this.unsubscribe.push(sub);
  }

  getDiagnosticGroup(id: number) {
    var diagnosticGroup = this.diagnosticGroups.find(a => a.icd10DiagnosticGroupId === id)
    return diagnosticGroup ? diagnosticGroup.code + ' - '+ diagnosticGroup.description: '';
  }

  getIcdCategories(icd10DiagnosticGroupId: number) {
    const icdModel = new ICD10CodeEntity();
    icdModel.EventType = EventTypeEnum.Disease;
    icdModel.ICD10DiagnosticGroupId = icd10DiagnosticGroupId;
    let sub = this.medicalService.getICD10CategoriesByEventTypeAndDiagnosticGroup(icdModel).subscribe(categories => {
      this.icdCategories = categories;
    });
    this.unsubscribe.push(sub);
  }

  getIcdCategory(id: number) {
    var icdCategory = this.icdCategories.find(a => a.icd10CategoryId === id)
    return icdCategory ? icdCategory.icd10CategoryCode + ' - '+ icdCategory.icd10CategoryDescription: '';
  }

  getIcdSubCategories(icdCategoryId: number, icd10DiagnosticGroupId: number) {
    const icdModel = new ICD10CodeEntity();
    icdModel.EventType = EventTypeEnum.Disease;
    icdModel.ICD10DiagnosticGroupId = icd10DiagnosticGroupId;
    icdModel.ICD10CategoryId = icdCategoryId;
    let sub = this.medicalService.getICD10SubCategoriesByEventTypeDRGAndCategory(icdModel).subscribe(subCategories => {
      this.icdSubCategories = subCategories;
    });
    this.unsubscribe.push(sub);
  }

  getICDSubCategory(id: number) {
    var icdSubCategory = this.icdSubCategories.find(a => a.icd10SubCategoryId === id)
    return icdSubCategory ? icdSubCategory.icd10SubCategoryCode + ' - '+ icdSubCategory.icd10SubCategoryDescription: '';
  }

  getICD10Codes(icd10CodeIds: string) {
    this.isICD10CodeLoading$.next(true);
    let sub = this.medicalService.getICD10Codes(icd10CodeIds).subscribe(results => {
      this.icd10Codes = results;
      this.isICD10CodeLoading$.next(false);
    });
    this.unsubscribe.push(sub);
  }

  getICD10Code(id: number) {
    var icd10Code = this.icd10Codes.find(a => a.icd10CodeId === id)
    return icd10Code ? icd10Code.icd10Code + ' - '+ icd10Code.icd10CodeDescription: '';
  }

  round(num: any) {
    const m = Number((Math.abs(num) * 100).toPrecision(1));
    return Math.round(m) / 100 * Math.sign(num);
  }

  roundTwo(num: any) {
    const m = Number((Math.abs(num) * 100).toPrecision(2));
    return Math.round(m) / 100 * Math.sign(num);
  }

  doOccupationValidation(startDate: Date) {
    const currentDate = new Date();
    startDate = new Date(startDate);
    const totalYears = this.monthDiff(startDate, currentDate) / 12;
    if (totalYears % 1 !== 0) {
      this.occupationYears = this.truncate(totalYears, 0);
    } else {
      this.occupationYears = totalYears;
    }
    this.monthsInOccupation = 0;
    this.daysInOccupation = 0;
    if (this.occupationYears === 0) {
      const differenceInTime = currentDate.getTime() - startDate.getTime();
      const differenceInDays = differenceInTime / (1000 * 3600 * 24);
      const daysWorked = this.roundTwo(differenceInDays);
      if (daysWorked > 59) {
        const monthsWorked = (this.round(totalYears) + '').split('.');
        this.monthsInOccupation = Number(monthsWorked[1]);
        this.daysInOccupation = 0;
      } else {
        this.monthsInOccupation = 0;
        this.daysInOccupation = daysWorked;
      }
    }
  }

  truncate(num: any, index = 0) {
    return +num.toString().slice(0, (num.toString().indexOf('.')) + (index + 1));
  }

  monthDiff(startDate: Date, currentDate: Date): number {
    let months;
    startDate = new Date(startDate);
    months = (currentDate.getFullYear() - startDate.getFullYear()) * 12;
    months -= startDate.getMonth();
    months += currentDate.getMonth();
    return months <= 0 ? 0 : months;
  }

  addBeneficiary(){
    const dialogRef = this.dialog.open(ManageBeneficiaryComponent, {
      width: '1024px',
      disableClose: true,
      data: {
        event: this.event,
        personEvent: this.event.personEvents[0],
        isWizard: true,
        isSpouse: this.isSpouse
      }
    });
    let sub = dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.event.personEvents[0].beneficiaries = new Array();
        this.beneficiariesDataSource = new Array();
        this.event.personEvents[0].beneficiaries.push(data.beneficiary);
        this.updateBeneficiaryTable();
        this.hasBeneficiaryData = true;
        this.getBeneficiaryDetails();
      }
    });
    this.unsubscribe.push(sub);
  }

  getBeneficiaryDetails(){
    if(this.event.personEvents[0].rolePlayer.rolePlayerId > 0){
      let sub = this.rolePlayerService.getRolePlayer(this.event.personEvents[0].rolePlayer.rolePlayerId).subscribe(employee =>{
          this.getBeneficiaries(employee.toRolePlayers);
        })
      this.unsubscribe.push(sub);
    }
  }

  filterBeneficiaryMenu(item: RolePlayer) {
    this.menus = null;
    this.menus =
      [
        { title: 'View', action: 'view', disable: false },
        { title: 'Edit', action: 'edit', disable: false },
        { title: 'Delete', action: 'delete', disable: false }
      ];
  }

  onBeneficiaryMenuItemClick(item: RolePlayer, menu: any): void {
    switch (menu.action) {
      case 'view':
      case 'edit':
        this.openBeneficiaryDialogView(menu.action, item);
        break;
      case 'delete':
        if (item) {
          this.openDialogDeleteBeneficiary(item);
        }
        break;
    }
  }

  openDialogDeleteBeneficiary(item: RolePlayer) {
    if (item) {
      let sub = this.confirmservice.confirmWithoutContainer(' Delete', ' Are you sure you want to delete beneficiary ' + item.displayName + '?', 'Center', 'Center', 'Yes', 'No').subscribe(
        result => {
          if (result === true) {
            this.beneficiariesDataSource.splice(0, 1);
            this.updateBeneficiaryTable();
          }
        });
        this.unsubscribe.push(sub);
      }
    }

  updateBeneficiaryTable() {
    if (this.beneficiariesTable) {
      this.beneficiariesTable.renderRows();
    }
    if (this.beneficiariesDataSource.length === 0) {
      this.hasBeneficiaryData = false;
    }
  }

  openBeneficiaryDialogView(menu: any,item: RolePlayer): void {
    const type = menu;
    const dialogRef = this.dialog.open(ManageBeneficiaryComponent, {
      width: '1024px',
      data: {
        event: this.event,
        dataType: type,
        beneficiary: item,
        isWizard: false,
        personEvent: this.event.personEvents[0]
      }
    });
    if (type === 'edit') {
      let sub = dialogRef.afterClosed().subscribe(data => {
        if (data) {
          this.event.personEvents[0].beneficiaries = data.beneficiaries;
          this.hasBeneficiaryData = true;
        }
      });
      this.unsubscribe.push(sub);
    }
  }

  toggleEarningsView(): boolean {
    return this.showEarnings = !this.showEarnings;
  }

  viewMedicalInvoices(){
    const dialogRef = this.dialog.open(MedicalInvoicesListComponent, {
      width: '1550px',
      disableClose: true,
      data: {
        personEvent: this.event.personEvents[0]
      }
    });
    let sub = dialogRef.afterClosed().subscribe(data => {
      if (data) {
      }
    });
    this.unsubscribe.push(sub);
  }
}
