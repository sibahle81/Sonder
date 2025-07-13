import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isNullOrUndefined } from 'util';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { UntypedFormBuilder, UntypedFormControl,  UntypedFormGroup } from '@angular/forms';
import ReportFormValidationUtility from 'projects/digicare/src/app/digi-manager/Utility/ReportFormValidationUtility';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { HealthCareProviderSearchComponent } from 'projects/medicare/src/app/medi-manager/views/shared/healthcareprovider-search/healthcareprovider-search.component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { FormValidation } from 'projects/shared-utilities-lib/src/lib/validators/form-validation';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { ChronicMedicationForm } from 'projects/medicare/src/app/preauth-manager/models/chronic-medication-form';
import { ChronicMedicationHistory } from 'projects/medicare/src/app/preauth-manager/models/chronic-medical-history';
import { ChronicScriptMedicine } from 'projects/medicare/src/app/preauth-manager/models/chronic-script-medicine';
import { ChronicMedicationFormRenewal } from 'projects/medicare/src/app/preauth-manager/models/chronic-renewal-medication-form';
import { ChronicScriptMedicineRenewal } from 'projects/medicare/src/app/preauth-manager/models/chronic-script-medicine-renewal';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import {PreAuthChronicRequestType} from 'projects/medicare/src/app/medi-manager/enums/chronic-application-type-enum';
import {PreAuthChronicRequestTypeNames} from 'projects/medicare/src/app/medi-manager/enums/chronic-application-type-names-enum';
import {DeliveryTypes} from 'projects/medicare/src/app/medi-manager/enums/delivery-type-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';

 @Component({
  selector: 'app-chronic-application-type',
  templateUrl: './chronic-application-type.component.html',
  styleUrls: ['./chronic-application-type.component.css'],
})

export class ChronicApplicationType extends WizardDetailBaseComponent<PreAuthorisation> {

  isInternalUser: boolean = true;
  isDuplicatePreAuth: boolean = false;
  authType: string;
  form: UntypedFormGroup;
 
  @ViewChild('healthCareProviderSearchComponent', { static: false }) private healthCareProviderSearchComponent: HealthCareProviderSearchComponent;

  currentUrl = this.activatedRoute.snapshot.params.type;
  healthCareProvider: HealthCareProvider;
  chronicMedicationForm = new ChronicMedicationForm();
  chronicRenewalMedicationForm = new ChronicMedicationFormRenewal();
  
  selectedCondition : any;
  isEditView: boolean = false;
  medicalConditions = ["PrescribedChronicMedicine","OtherExisitingMedicine"];
  medicalHistoryColumns = ["disease", "diagnosedDate", "treatment","action"];
  medicationColumns = ["condition", "icd10Code", "medicationPrescribed", "dosage", "numberOfRepeats","action"];
  hivStatuses = ["Unknown","Yes","No"];
  medicalHistorySource : any = [];
  medicationSource : any = [];
  chronicMedicationFormList = [];
  chronicRenewalMedicationFormList = [];
  
  claimId: number;
  preAuthId: number;
  linkedId: number;
  requiredDocumentsUploaded = false;
  documentSystemName = DocumentSystemNameEnum.MediCareManager;
  documentSet = DocumentSetEnum.MedicalChronicDocuments;
  documentTypeFilter: DocumentTypeEnum[] = [];
  selectedChronicAppType: string;
  selectedDelieryMethod: number;
  chronicApplicationTypes = ["New Chronic Application","Renewal Chronic Application"];
  isNewChronicApplication: boolean = false;
  showChronicForm: boolean = false;
  medicalHistoryIndex: number = -1;
  medicationIndex: number = -1;

  deliveryCollection = DeliveryTypes.Collection;
  deliveryCourier= DeliveryTypes.Courier;

  clinicalAuthNumber = [];
  documentKeyValue: number = 0;


  clinicalTypesofPain = [{selected: false , text : "Neurogenic"},{selected: false , text : "Mechanical"},{selected: false , text : "Degenerative"},
  {selected: false , text : "Musclespasm"},{selected: false , text : "Fibromyalgia"}];

  adjuvantsforPain = [{selected: false , text : "LifeStyleChanges"}, {selected: false , text : "Physiotherpy"},{selected: false , text : "NerveBlock"},
  {selected: false , text : "Anthroplasty"},{selected: false , text : "Psychotherapy"},{selected: false , text : "Acupunture"}];


  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    appEventsManager: AppEventsManager,
    private mediCarePreAuthService: MediCarePreAuthService,
    private readonly HealthcareProviderService: HealthcareProviderService,
    private readonly claimCareService: ClaimCareService,
    readonly confirmservice: ConfirmationDialogsService,
    public datePipe: DatePipe,) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
    this.createForm();
    var currentUser = this.authService.getCurrentUser();
    this.isInternalUser = currentUser.isInternalUser;
     
    FormValidation.markFormTouched(this.form);    
  }

  onChange(): void {
    this.populateModel();
  }

  createForm(): void {
    if (this.form == undefined) {
      this.form = this.formBuilder.group({
        chronicApplicationType: new UntypedFormControl(),
        diagnosedDate: new UntypedFormControl(),
        treatment: new UntypedFormControl(),
        disease: new UntypedFormControl(),
        height: new UntypedFormControl(),
        weight: new UntypedFormControl(),
        bloodPressure: new UntypedFormControl(),
        urine: new UntypedFormControl(),
        allergies: new UntypedFormControl(),
        motivation: new UntypedFormControl(),
        condition: new UntypedFormControl(),
        icd10Code_current: new UntypedFormControl(),
        medicationPrescribed: new UntypedFormControl(),
        dosage: new UntypedFormControl(),
        numberOfRepeats: new UntypedFormControl(),
        deliveryMethod: new UntypedFormControl(),
        declaration: new UntypedFormControl(),
        authorisedNumber: new UntypedFormControl(),
        typesOfPain: new UntypedFormControl(),
        adjuvantsPain: new UntypedFormControl(),
        objectiveEvaluation: new UntypedFormControl(),
        injuryRelatedProblem: new UntypedFormControl(),
        hivStatus: new UntypedFormControl(),
        postOfficeAddress: new UntypedFormControl(),
        residentialAddress: new UntypedFormControl(),
        postalAddress: new UntypedFormControl(),
        uploadDocuments: new UntypedFormControl()
      });
    }
  }

  onLoadLookups(): void {
  }

  ngAfterViewInit(): void { 
   
  }

  ngAfterContentInit(): void {
  }


  populateModel(): void {
    if (!this.model) return;    
    const form = this.form.getRawValue();  
    this.model.chronicApplicationType = form.chronicApplicationType;
    this.selectedChronicAppType = form.chronicApplicationType; 
    
    if(this.selectedChronicAppType == PreAuthChronicRequestTypeNames.NewChronicApplicationRequest){
    const chronicMedicationModel = this.model.chronicMedicationForms && this.model.chronicMedicationForms.length > 0 ? this.model.chronicMedicationForms[0] : null;
    const chronicMedicationHistories : Array<ChronicMedicationHistory> = [];
    const ChronicScriptMedicines : Array<ChronicScriptMedicine> = [];
    this.chronicMedicationForm.chronicMedicationFormId = form.chronicMedicationFormId ? form.chronicMedicationFormId : chronicMedicationModel?.chronicMedicationFormId ? chronicMedicationModel?.chronicMedicationFormId : 0;
    if(this.medicalHistorySource.length > 0){
      this.medicalHistorySource.forEach(item => {
        const chronicMedicationHistory = new ChronicMedicationHistory();
        chronicMedicationHistory.dateDiagnosed = item['diagnosedDate'];
        chronicMedicationHistory.treatment = item['treatment'];
        chronicMedicationHistory.chronicMedicationFormId = item.chronicMedicationFormId;
        chronicMedicationHistory.chronicMedicalHistoryId = item.chronicMedicalHistoryId;
        chronicMedicationHistory.disease = item['disease'];
        chronicMedicationHistories.push(chronicMedicationHistory);
     });
      this.chronicMedicationForm.chronicMedicalHistories = chronicMedicationHistories;
    }

    if(this.medicationSource.length > 0){
      this.medicationSource.forEach(item => {
        const chronicScriptMedicine = new ChronicScriptMedicine();
        chronicScriptMedicine.description  =  item['condition'];
        chronicScriptMedicine.dosage = item['dosage'];
        chronicScriptMedicine.icd10Code = item['icd10Code'];
        chronicScriptMedicine.numberOfRepeats = item['numberOfRepeats'];
        chronicScriptMedicine.medicinePrescribed = item['medicationPrescribed'];
        chronicScriptMedicine.chronicMedicationFormId = item.chronicMedicationFormId ? item.chronicMedicationFormId : 0;
        chronicScriptMedicine.chronicScriptMedicineId = item.chronicScriptMedicineId ? item.chronicScriptMedicineId : 0;
        if (item['condition'] == this.medicalConditions[0]){
        chronicScriptMedicine.isPreExistOrChronic = true;
        }else{
        chronicScriptMedicine.isPreExistOrChronic = false;
        }
        chronicScriptMedicine.icd10codeId = item.icd10codeId ? item.icd10codeId : 0;
        ChronicScriptMedicines.push(chronicScriptMedicine);
     });
     this.chronicMedicationForm.chronicScriptMedicines = ChronicScriptMedicines;
    }
        
    this.chronicMedicationForm.allergies = form.allergies ? form.allergies : chronicMedicationModel?.allergies ? chronicMedicationModel?.allergies : '';
    this.chronicMedicationForm.height = form.height ? form.height : chronicMedicationModel?.height ? chronicMedicationModel?.height : '';
    this.chronicMedicationForm.weight = form.weight ? form.weight : chronicMedicationModel?.weight ? chronicMedicationModel?.weight : '';
    this.chronicMedicationForm.bloodPressure = form.bloodPressure ? form.bloodPressure : chronicMedicationModel?.bloodPressure ? chronicMedicationModel?.bloodPressure : '';
    this.chronicMedicationForm.urine = form.urine ? form.urine : chronicMedicationModel?.urine ? chronicMedicationModel?.urine : '';
    this.chronicMedicationForm.description = form.motivation ? form.motivation : chronicMedicationModel?.description ? chronicMedicationModel?.description : '';
    this.chronicMedicationForm.hivStatus = form.hivStatus ? form.hivStatus : chronicMedicationModel?.hivStatus ? chronicMedicationModel?.hivStatus : '';

    this.chronicMedicationForm.deliveryMethod = form.deliveryMethod ?  Number(form.deliveryMethod)  : chronicMedicationModel?.deliveryMethod ?  Number(chronicMedicationModel?.deliveryMethod) :  0;   
     
    this.chronicMedicationForm.deliveryAddress = form.postalAddress ? form.postalAddress : form.residentialAddress ? form.residentialAddress : form.postOfficeAddress ? form.postOfficeAddress : '';

 
    this.chronicMedicationForm.hobbies=null;
    this.chronicMedicationForm.chronicMedicationFormId = this.chronicMedicationForm.chronicMedicationFormId ? this.chronicMedicationForm.chronicMedicationFormId : 0;
    this.chronicMedicationForm.claimId = this.model.claimId;
    this.chronicMedicationForm.isSignedByHcp = true;
    this.chronicMedicationForm.isSignedByApplicant = true;   
    this.chronicMedicationForm.dateFormFilled = this.chronicMedicationForm.dateFormFilled ? this.chronicMedicationForm.dateFormFilled : new Date();
    this.chronicMedicationForm.dateSubmitted = this.chronicMedicationForm.dateSubmitted ? this.chronicMedicationForm.dateSubmitted : new Date();
    this.chronicMedicationForm.dateConsulted = this.chronicMedicationForm.dateConsulted ? this.chronicMedicationForm.dateConsulted : new Date();
    this.chronicMedicationForm.dateSignedByHcp = this.chronicMedicationForm.dateSignedByHcp ? this.chronicMedicationForm.dateSignedByHcp : new Date();
    this.chronicMedicationForm.preAuthId = this.model.preAuthId;
    this.chronicMedicationForm.medicalServiceProviderId = this.chronicMedicationForm.medicalServiceProviderId ? this.chronicMedicationForm.medicalServiceProviderId : chronicMedicationModel?.medicalServiceProviderId ? chronicMedicationModel?.medicalServiceProviderId : 0;
    this.chronicMedicationFormList = [];   
    this.chronicMedicationFormList.push(this.chronicMedicationForm);
    this.model.chronicMedicationForms = this.chronicMedicationFormList;
  }
  else{
    const chronicScriptMedicineRenewals : Array<ChronicScriptMedicineRenewal> = [];
    const chronicRenewalsMedicationModel = this.model.chronicMedicationFormRenewals && this.model.chronicMedicationFormRenewals.length > 0 ? this.model.chronicMedicationFormRenewals[0] : null;
    this.chronicRenewalMedicationForm.chronicMedicationFormRenewalId = form.chronicMedicationFormRenewalId ? form.chronicMedicationFormRenewalId : 0;
    if(this.medicationSource.length > 0){
      this.medicationSource.forEach(item => {
        const chronicScriptMedicineRenewal = new ChronicScriptMedicineRenewal();
        chronicScriptMedicineRenewal.description = item['description'];
        chronicScriptMedicineRenewal.dosage = item['dosage'];
        chronicScriptMedicineRenewal.icd10Code = item['icd10Code'];
        chronicScriptMedicineRenewal.numberOfRepeats = item['numberOfRepeats'];
        chronicScriptMedicineRenewal.medicinePrescribed = item['medicationPrescribed'];
        chronicScriptMedicineRenewal.chronicMedicationFormRenewalId = item.chronicMedicationFormRenewalId ? item.chronicMedicationFormRenewalId : 0;
        chronicScriptMedicineRenewal.chronicScriptMedicineRenewalId = item.chronicScriptMedicineRenewalId ? item.chronicScriptMedicineRenewalId : 0;       
        chronicScriptMedicineRenewal.icd10codeId = item.icd10codeId ? item.icd10codeId  : 0;
        chronicScriptMedicineRenewals.push(chronicScriptMedicineRenewal);
     });
     this.chronicRenewalMedicationForm.chronicScriptMedicineRenewals = chronicScriptMedicineRenewals;
    }
    this.chronicRenewalMedicationForm.authorisedChronicAuthorisationId = this.selectedCondition;
    this.chronicRenewalMedicationForm.claimId = this.model.claimId;
    this.chronicRenewalMedicationForm.description = form.motivation ? form.motivation : chronicRenewalsMedicationModel.description;
    this.chronicRenewalMedicationForm.isNeurogenicPain = this.clinicalTypesofPain[0].selected ? true : false ;
    this.chronicRenewalMedicationForm.isMechanicalPain = this.clinicalTypesofPain[1].selected ? true : false ;
    this.chronicRenewalMedicationForm.isDegenerativePain =this.clinicalTypesofPain[2].selected ? true : false ;
    this.chronicRenewalMedicationForm.isMuslcespasmPain = this.clinicalTypesofPain[3].selected ? true : false ;
    this.chronicRenewalMedicationForm.isFibromialgiaPain = this.clinicalTypesofPain[4].selected ? true : false ;  
    this.chronicRenewalMedicationForm.painEvaluation = form.objectiveEvaluation ? Number(form.objectiveEvaluation) : chronicRenewalsMedicationModel.painEvaluation ?  chronicRenewalsMedicationModel.painEvaluation : 0;
    this.chronicRenewalMedicationForm.continuousDuration = 0;
    this.chronicRenewalMedicationForm.isLifeStyleChanges =  this.adjuvantsforPain[0].selected ? true : false;
    this.chronicRenewalMedicationForm.isPhysiotherapy = this.adjuvantsforPain[1].selected ? true : false;
    this.chronicRenewalMedicationForm.isNerveBlock = this.adjuvantsforPain[2].selected ? true : false;
    this.chronicRenewalMedicationForm.isArthroplasty =this.adjuvantsforPain[3].selected ? true : false;
    this.chronicRenewalMedicationForm.isPsychotherapy = this.adjuvantsforPain[4].selected ? true : false;
    this.chronicRenewalMedicationForm.isAccupuncture = this.adjuvantsforPain[5].selected ? true : false;

    this.chronicRenewalMedicationForm.dateSubmitted  =  this.chronicRenewalMedicationForm.dateSubmitted ? this.chronicRenewalMedicationForm.dateSubmitted : new Date();
    this.chronicRenewalMedicationForm.dateConsulted = this.chronicRenewalMedicationForm.dateConsulted ? this.chronicRenewalMedicationForm.dateConsulted : new Date();
    this.chronicRenewalMedicationForm.hobbies = null;
    this.chronicRenewalMedicationForm.deliveryMethod = form.deliveryMethod ?  Number(form.deliveryMethod)  : chronicRenewalsMedicationModel.deliveryMethod ?  Number(chronicRenewalsMedicationModel.deliveryMethod) :  0;      
    this.chronicRenewalMedicationForm.deliveryAddress = form.postalAddress ? form.postalAddress : form.residentialAddress ? form.residentialAddress : form.postOfficeAddress ? form.postOfficeAddress : '';

    this.chronicRenewalMedicationForm.preAuthId = this.model.preAuthId;

    this.chronicRenewalMedicationForm.isSignedByHcp =  true;
    this.chronicRenewalMedicationForm.dateSignedByHcp =  this.chronicRenewalMedicationForm.dateSignedByHcp ? this.chronicRenewalMedicationForm.dateSignedByHcp : new Date();
    
    this.chronicRenewalMedicationFormList = [];   
    this.chronicRenewalMedicationFormList.push(this.chronicRenewalMedicationForm);
    this.model.chronicMedicationFormRenewals = this.chronicRenewalMedicationFormList;
  }
}

  populateForm(): void {
    if (!this.model) return;   
    const form = this.form.controls;
    const chronicApplicationType = this.model.chronicMedicationForms && this.model.chronicMedicationForms.length > 0 ? PreAuthChronicRequestTypeNames.NewChronicApplicationRequest :  this.model.chronicMedicationFormRenewals && this.model.chronicMedicationFormRenewals.length > 0 ? PreAuthChronicRequestTypeNames.RenewalRequest : PreAuthChronicRequestTypeNames.NewChronicApplicationRequest;
    this.selectedChronicAppType = chronicApplicationType;  
    form.chronicApplicationType.setValue(chronicApplicationType);
    this.claimId = this.model.claimId;     
    this.documentTypeFilter = [];
    if(this.selectedChronicAppType == PreAuthChronicRequestTypeNames.NewChronicApplicationRequest){
    this.isNewChronicApplication = true;
    this.showChronicForm = true;
    this.documentKeyValue = this.claimId;
    this.documentTypeFilter.push(DocumentTypeEnum.DoctorsPrescriptionScript);
    this.documentTypeFilter.push(DocumentTypeEnum.ChronicNewApplicationFormOriginal); 

    if (!this.model.chronicMedicationForms) return;
    if (this.model.chronicMedicationForms.length == 0) return;          

    const chronicMedicationForm = this.model.chronicMedicationForms[0];

    if(chronicMedicationForm)
    {
    this.preAuthId = (chronicMedicationForm.preAuthId > 0) ? chronicMedicationForm.preAuthId : null; 
    
    if(chronicMedicationForm.preAuthId > 0){
      this.isEditView = true;
      this.documentKeyValue = chronicMedicationForm.preAuthId;
    }

    if(chronicMedicationForm.chronicMedicalHistories?.length > 0){
      this.medicalHistorySource = [];
      chronicMedicationForm.chronicMedicalHistories.forEach((item , index) => {
        this.medicalHistorySource.push({id: index, chronicMedicalHistoryId: item.chronicMedicalHistoryId, chronicMedicationFormId : item.chronicMedicationFormId,  diagnosedDate: item.dateDiagnosed, treatment: item.treatment, disease: item.disease});
     });
     this.medicalHistorySource = [...this.medicalHistorySource];
    }

    if(chronicMedicationForm.chronicScriptMedicines?.length > 0){
      this.medicationSource = [];
      chronicMedicationForm.chronicScriptMedicines.forEach((item , index) => {
        this.medicationSource.push({id: index,chronicScriptMedicineId : item.chronicScriptMedicineId, chronicMedicationFormId: item.chronicMedicationFormId,  condition: item.description, icd10Code: item.icd10Code, medicationPrescribed: item.medicinePrescribed, dosage: item.dosage, numberOfRepeats: item.numberOfRepeats});
      });
     this.medicationSource = [...this.medicationSource];
    }
   
    if(chronicMedicationForm.weight)
      form.weight.setValue(chronicMedicationForm.weight);
    if(chronicMedicationForm.height)
      form.height.setValue(chronicMedicationForm.height);
    if(chronicMedicationForm.bloodPressure)
      form.bloodPressure.setValue(chronicMedicationForm.bloodPressure);
    if(chronicMedicationForm.urine)
      form.urine.setValue(chronicMedicationForm.urine);
    if(chronicMedicationForm.description)
      form.motivation.setValue(chronicMedicationForm.description);
    if(chronicMedicationForm.hivStatus)
      form.hivStatus.setValue(chronicMedicationForm.hivStatus);
    if(chronicMedicationForm.allergies)
      form.allergies.setValue(chronicMedicationForm.allergies);

    if(chronicMedicationForm.deliveryMethod)
    {  
      form.deliveryMethod.setValue(chronicMedicationForm.deliveryMethod);
      this.selectedDelieryMethod = chronicMedicationForm.deliveryMethod;
    }

    if(chronicMedicationForm.deliveryAddress && chronicMedicationForm.deliveryMethod == this.deliveryCollection)  
      form.postOfficeAddress.setValue(chronicMedicationForm.deliveryAddress);
    if(chronicMedicationForm.deliveryAddress && chronicMedicationForm.deliveryMethod == this.deliveryCourier)  
      form.residentialAddress.setValue(chronicMedicationForm.deliveryAddress);
      
    if(!isNullOrUndefined(chronicMedicationForm.medicalServiceProviderId) && chronicMedicationForm.medicalServiceProviderId > 0){
        this.HealthcareProviderService.getHealthCareProviderById(chronicMedicationForm.medicalServiceProviderId).subscribe((result) => {
          if (result !== null && result.rolePlayerId > 0) {
            this.healthCareProvider = result;
            this.healthCareProviderSearchComponent?.loadExistingAuthHealthcareProviderDetails(this.healthCareProvider.rolePlayerId);
          }
        });
    }
  }

  }else{
   
   if( this.clinicalAuthNumber &&  this.clinicalAuthNumber.length == 0 && this.model.claimId > 0){    
    this.mediCarePreAuthService.getPreAuthsByClaimId(this.model.claimId).subscribe((result) => {
      if (result !== null){
        this.clinicalAuthNumber = result?.map(item => {return { preAuthId : item.preAuthId , preAuthNumber: item.preAuthNumber }});
      }
    });
  }

  this.documentKeyValue = this.claimId;
  this.documentTypeFilter.push(DocumentTypeEnum.DoctorsPrescriptionScript);
  this.documentTypeFilter.push(DocumentTypeEnum.RenewalofChronicApplicationFormOriginal);

  if (!this.model.chronicMedicationFormRenewals) return;
  if (this.model.chronicMedicationFormRenewals.length == 0) return;

    const chronicRenewalMedicationForm = this.model.chronicMedicationFormRenewals[0];
   
    if(chronicRenewalMedicationForm)
    {
    this.preAuthId = (chronicRenewalMedicationForm.preAuthId > 0) ? chronicRenewalMedicationForm.preAuthId : null;    
    this.showChronicForm = true;
    this.isNewChronicApplication = false;
    if(chronicRenewalMedicationForm.preAuthId > 0){
      this.isEditView = true;
      this.documentKeyValue = chronicRenewalMedicationForm.preAuthId;
    }

    if(chronicRenewalMedicationForm.chronicScriptMedicineRenewals?.length > 0){
      this.medicationSource = [];
      chronicRenewalMedicationForm.chronicScriptMedicineRenewals.forEach((item , index) => {
        this.medicationSource.push({id: index, chronicMedicationFormRenewalId: item.chronicMedicationFormRenewalId, chronicScriptMedicineRenewalId: item.chronicScriptMedicineRenewalId, description: item.description, icd10Code: item.icd10Code, medicationPrescribed: item.medicinePrescribed, dosage: item.dosage, numberOfRepeats: item.numberOfRepeats});
      });
     this.medicationSource = [...this.medicationSource];
    }

    if(chronicRenewalMedicationForm.description)
      form.motivation.setValue(chronicRenewalMedicationForm.description);
    if(chronicRenewalMedicationForm.painEvaluation)
      form.painEvaluation.setValue(chronicRenewalMedicationForm.painEvaluation);
    if(chronicRenewalMedicationForm.continuousDuration)
      form.continuousDuration.setValue(chronicRenewalMedicationForm.continuousDuration);
    
    if(chronicRenewalMedicationForm.deliveryMethod){
      form.deliveryMethod.setValue(chronicRenewalMedicationForm.deliveryMethod);
      this.selectedDelieryMethod = chronicRenewalMedicationForm.deliveryMethod;
    }
    if(chronicRenewalMedicationForm.deliveryAddress && chronicRenewalMedicationForm.deliveryMethod == this.deliveryCollection)  
      form.postOfficeAddress.setValue(chronicRenewalMedicationForm.deliveryAddress);
    if(chronicRenewalMedicationForm.deliveryAddress && chronicRenewalMedicationForm.deliveryMethod == this.deliveryCourier)  
      form.residentialAddress.setValue(chronicRenewalMedicationForm.deliveryAddress);

    if(chronicRenewalMedicationForm.isNeurogenicPain)
      this.clinicalTypesofPain[0].selected = true;
    if(chronicRenewalMedicationForm.isMechanicalPain)
      this.clinicalTypesofPain[1].selected = true;
    if(chronicRenewalMedicationForm.isDegenerativePain)
      this.clinicalTypesofPain[2].selected = true;
    if(chronicRenewalMedicationForm.isPsychogenicPain)
      this.clinicalTypesofPain[3].selected = true;
    if(chronicRenewalMedicationForm.isMuslcespasmPain)
      this.clinicalTypesofPain[4].selected = true;
    if(chronicRenewalMedicationForm.isFibromialgiaPain)
      this.clinicalTypesofPain[5].selected = true;

    if(chronicRenewalMedicationForm.isLifeStyleChanges)
      this.adjuvantsforPain[0].selected = true;
    if(chronicRenewalMedicationForm.isPhysiotherapy)
      this.adjuvantsforPain[1].selected = true;
    if(chronicRenewalMedicationForm.isNerveBlock)
      this.adjuvantsforPain[2].selected = true;
    if(chronicRenewalMedicationForm.isArthroplasty)
      this.adjuvantsforPain[3].selected = true;
    if(chronicRenewalMedicationForm.isPsychotherapy)
      this.adjuvantsforPain[4].selected = true;
    if(chronicRenewalMedicationForm.isAccupuncture)
      this.adjuvantsforPain[5].selected = true;

    if(!isNullOrUndefined(chronicRenewalMedicationForm.medicalServiceProviderId) && chronicRenewalMedicationForm.medicalServiceProviderId > 0){
      this.HealthcareProviderService.getHealthCareProviderById(chronicRenewalMedicationForm.medicalServiceProviderId).subscribe((result) => {
        if (result !== null && result.rolePlayerId > 0) {
          this.healthCareProvider = result;
          this.healthCareProviderSearchComponent?.loadExistingAuthHealthcareProviderDetails(this.healthCareProvider.rolePlayerId);
        }
      });
    }
    }

}

}

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null) {  
      ReportFormValidationUtility.FieldRequired('chronicApplicationType', 'Chronic Application Type', this.form, validationResult);          
      if(!this.requiredDocumentsUploaded){
        ReportFormValidationUtility.FieldRequired('uploadDocuments', 'Upload Documents', this.form, validationResult);
      }

      if(this.selectedChronicAppType == PreAuthChronicRequestTypeNames.NewChronicApplicationRequest){ 
        
        if(this.medicalHistorySource.length == 0){
          ReportFormValidationUtility.FieldRequired('disease', 'Disease', this.form, validationResult);
          ReportFormValidationUtility.FieldRequired('diagnosedDate', 'Date Diagnosed', this.form, validationResult);
          ReportFormValidationUtility.FieldRequired('treatment', 'Treatment', this.form, validationResult);
        }
  
        if(this.medicationSource.length == 0){        
          ReportFormValidationUtility.FieldRequired('condition', 'Condition', this.form, validationResult);
          ReportFormValidationUtility.FieldRequired('icd10Code_current', 'ICD10 Code', this.form, validationResult);
          ReportFormValidationUtility.FieldRequired('medicationPrescribed', 'Medication Prescribed', this.form, validationResult);
          ReportFormValidationUtility.FieldRequired('dosage', 'Dosage', this.form, validationResult);
          ReportFormValidationUtility.FieldRequired('numberOfRepeats', 'Number Of Repeats', this.form, validationResult);
        }
  
        ReportFormValidationUtility.FieldRequired('deliveryMethod', 'Delivery Method', this.form, validationResult);
        
        if(this.model.chronicMedicationForms[0].medicalServiceProviderId == undefined){
          ReportFormValidationUtility.FieldRequired('declaration', 'Declaration', this.form, validationResult);
        }
      }
      else{
        ReportFormValidationUtility.FieldRequired('authorisedNumber', 'Authorised Chronic Auth Number', this.form, validationResult);
        if(this.adjuvantsforPain.filter(item => item.selected).length == 0){
          ReportFormValidationUtility.FieldRequired('adjuvantsPain', 'Alternative and adjuvants used for pain', this.form, validationResult);
        }
        if(this.clinicalTypesofPain.filter(item => item.selected).length == 0){
          ReportFormValidationUtility.FieldRequired('typesOfPain', 'Types of Pain', this.form, validationResult);
        }
        ReportFormValidationUtility.FieldRequired('objectiveEvaluation', 'Objective Evaluation of Pain', this.form, validationResult);
        ReportFormValidationUtility.FieldRequired('motivation', 'Motivation', this.form, validationResult);         
  
        if(this.medicationSource.length == 0){        
          ReportFormValidationUtility.FieldRequired('injuryRelatedProblem', 'Injury Related Problem', this.form, validationResult);
          ReportFormValidationUtility.FieldRequired('icd10Code_current', 'ICD10 Code', this.form, validationResult);
          ReportFormValidationUtility.FieldRequired('medicationPrescribed', 'Medication Prescribed', this.form, validationResult);
          ReportFormValidationUtility.FieldRequired('dosage', 'Dosage', this.form, validationResult);
          ReportFormValidationUtility.FieldRequired('numberOfRepeats', 'Number Of Repeats', this.form, validationResult);
        }
  
        ReportFormValidationUtility.FieldRequired('deliveryMethod', 'Delivery Method', this.form, validationResult);
        
        if(this.model.chronicMedicationFormRenewals[0].medicalServiceProviderId == undefined){
          ReportFormValidationUtility.FieldRequired('declaration', 'Declaration', this.form, validationResult);
        }
      }
    }
    return validationResult;
  }


  resetForm(): void {
    this.form.reset();
    this.healthCareProviderSearchComponent.form.reset();
  }

  onHealthCareProviderChanged(event: any){
    if(this.selectedChronicAppType == PreAuthChronicRequestTypeNames.NewChronicApplicationRequest){
      this.chronicMedicationForm.medicalServiceProviderId = event.rolePlayerId;      
    }else{
      this.chronicRenewalMedicationForm.medicalServiceProviderId = event.rolePlayerId;      
    }
  } 

  addHistory(){
    let diagnosedDate =this.form.controls.diagnosedDate.getRawValue();   
    const treatment = this.form.controls.treatment.getRawValue();
    const disease = this.form.controls.disease.getRawValue();

    if(diagnosedDate && treatment && disease){
      if(typeof diagnosedDate == 'string'){
        diagnosedDate = moment(diagnosedDate).format('YYYY/MM/DD');
      }else{
        diagnosedDate = diagnosedDate.format('YYYY/MM/DD');
      }   
      const row_count = this.medicalHistorySource.length + 1;
      this.form.controls.diagnosedDate.setValue('');    
      this.form.controls.treatment.setValue('');    
      this.form.controls.disease.setValue('');
      if(this.medicalHistoryIndex > -1){
        this.medicalHistorySource[this.medicalHistoryIndex].diagnosedDate = diagnosedDate;
        this.medicalHistorySource[this.medicalHistoryIndex].treatment = treatment;
        this.medicalHistorySource[this.medicalHistoryIndex].disease = disease;
        this.medicalHistoryIndex = -1; //reset index
      }else{
        this.medicalHistorySource.push({id: row_count, chronicMedicalHistoryId: 0, diagnosedDate: diagnosedDate, treatment: treatment, disease: disease});
        this.medicalHistorySource = [...this.medicalHistorySource];  
      }  
    }
  }

  addMedication(){
    const condition = this.form.controls.condition?.getRawValue();
    const injuryRelatedProblem = this.form.controls.injuryRelatedProblem.getRawValue();    
    const icd10_code = this.form.controls.icd10Code_current.getRawValue();
    const medicationPrescribed = this.form.controls.medicationPrescribed.getRawValue();
    const dosage = this.form.controls.dosage.getRawValue();
    const numberOfRepeats = this.form.controls.numberOfRepeats.getRawValue();
    

    if(icd10_code && medicationPrescribed && dosage && numberOfRepeats){
      const row_count = this.medicationSource.length + 1;
      this.form.controls.icd10Code_current.setValue('');    
      this.form.controls.medicationPrescribed.setValue('');
      this.form.controls.dosage.setValue('');
      this.form.controls.numberOfRepeats.setValue('');
      if(condition){
        this.form.controls.condition.setValue(''); 
        if(this.medicationIndex > -1){
          this.medicationSource[this.medicationIndex].condition = condition;
          this.medicationSource[this.medicationIndex].icd10Code = icd10_code;
          this.medicationSource[this.medicationIndex].medicationPrescribed = medicationPrescribed;
          this.medicationSource[this.medicationIndex].dosage = dosage;
          this.medicationSource[this.medicationIndex].numberOfRepeats = numberOfRepeats;
          this.medicationIndex = -1;
        }else{
          this.medicationSource.push({id: row_count, chronicScriptMedicineId: 0, condition: condition, icd10Code: icd10_code, medicationPrescribed : medicationPrescribed, dosage: dosage, numberOfRepeats: numberOfRepeats});
          this.medicationSource = [...this.medicationSource];
        }
      }
  
      if(injuryRelatedProblem){
        this.form.controls.injuryRelatedProblem.setValue('');
        if(this.medicalHistoryIndex > -1){
          this.medicationSource[this.medicationIndex].description = injuryRelatedProblem;
          this.medicationSource[this.medicationIndex].icd10Code = icd10_code;
          this.medicationSource[this.medicationIndex].medicationPrescribed = medicationPrescribed;
          this.medicationSource[this.medicationIndex].dosage = dosage;
          this.medicationSource[this.medicationIndex].numberOfRepeats = numberOfRepeats;
          this.medicationIndex = -1;
        }else{
          this.medicationSource.push({id: row_count, chronicScriptMedicineRenewalId: 0, description: injuryRelatedProblem, icd10Code: icd10_code, medicationPrescribed : medicationPrescribed, dosage: dosage, numberOfRepeats: numberOfRepeats});
          this.medicationSource = [...this.medicationSource];
        }
      }      
    }
  }

  onRemoveMedicalHistory(item: any): void {    
    if (item) {
      this.medicalHistorySource = this.medicalHistorySource?.filter((row: any) => row.id != item.id);
        if( this.model?.chronicMedicationForms?.length > 0){
          this.model.chronicMedicationForms[0].chronicMedicalHistories = this.model?.chronicMedicationForms[0]?.chronicMedicalHistories?.filter((row: any) => row.id != item.id);
        }
        
    }   
  }

  onEditMedicalHistory(item: any): void {    
    if (item) {
       const medicalHistorySource = this.medicalHistorySource?.filter((row: any) => row.id == item.id);
        if(medicalHistorySource && medicalHistorySource.length > 0){
          this.medicalHistoryIndex = medicalHistorySource[0].id;
          this.form.controls.diagnosedDate.setValue(moment(medicalHistorySource[0].diagnosedDate));  
          this.form.controls.treatment.setValue(medicalHistorySource[0].treatment);  
          this.form.controls.disease.setValue(medicalHistorySource[0].disease);  
        }
    }   
  }

  onRemoveMedication(item: any): void {   
    if (item) {
        this.medicationSource = this.medicationSource?.filter((row: any) => row.id != item.id);
        if(this.model?.chronicMedicationForms?.length > 0){
          this.model.chronicMedicationForms[0].chronicScriptMedicines = this.model?.chronicMedicationForms[0]?.chronicScriptMedicines.filter((row: any) => row.id != item.id);
        }
    }   
  }
  onEditMedication(item: any): void {   
    if (item) {
        const medicationSource = this.medicationSource?.filter((row: any) => row.id == item.id);
        if(medicationSource && medicationSource.length > 0){
          this.medicationIndex = medicationSource[0].id;
          if(this.selectedChronicAppType == PreAuthChronicRequestTypeNames.NewChronicApplicationRequest){
            this.form.controls.condition.setValue(medicationSource[0].condition);
          } 
          if(this.selectedChronicAppType == PreAuthChronicRequestTypeNames.RenewalRequest){
            this.form.controls.injuryRelatedProblem.setValue(medicationSource[0].description);  
          }
          this.form.controls.icd10Code_current.setValue(medicationSource[0].icd10Code);
          this.form.controls.medicationPrescribed.setValue(medicationSource[0].medicationPrescribed);  
          this.form.controls.dosage.setValue(medicationSource[0].dosage);  
          this.form.controls.numberOfRepeats.setValue(medicationSource[0].numberOfRepeats);  
        }
    }   
  }

  onChronicApplicationType(event: any) {

    this.selectedChronicAppType =  event.value;
    this.showChronicForm = true;
    this.isNewChronicApplication = false;
    const form = this.form.controls;
    form.deliveryMethod.setValue(null);
    form.postalAddress.setValue(null);
    form.postOfficeAddress.setValue(null);
    form.residentialAddress.setValue(null);
    if(this.selectedChronicAppType == PreAuthChronicRequestTypeNames.NewChronicApplicationRequest){
        this.isNewChronicApplication = true;       
        const chronicMedicationForm = this.model.chronicMedicationForms ? this.model.chronicMedicationForms[0] : null;
        if(chronicMedicationForm){
          form.deliveryMethod.setValue(chronicMedicationForm.deliveryMethod);
          form.postOfficeAddress.setValue(chronicMedicationForm.deliveryAddress);
          this.documentTypeFilter = [];
          this.model.preAuthChronicRequestTypeId = PreAuthChronicRequestType.NewChronicApplicationRequest;
          this.documentTypeFilter.push(DocumentTypeEnum.DoctorsPrescriptionScript);
          this.documentTypeFilter.push(DocumentTypeEnum.ChronicNewApplicationFormOriginal);
          if(this.preAuthId > 0){
            this.documentKeyValue = this.preAuthId;
          }else{
            this.documentKeyValue = this.claimId;
          }
          this.healthCareProviderSearchComponent?.loadExistingAuthHealthcareProviderDetails(chronicMedicationForm.medicalServiceProviderId);
        }else{
          this.healthCareProviderSearchComponent.form.reset();
          this.documentKeyValue = 0;
        }
    }else{   
      
      if( this.clinicalAuthNumber &&  this.clinicalAuthNumber.length == 0 && this.model.claimId > 0){    
        this.mediCarePreAuthService.getPreAuthsByClaimId(this.model.claimId).subscribe((result) => {
          if (result !== null){
            this.clinicalAuthNumber = result?.map(item => {return { preAuthId : item.preAuthId , preAuthNumber: item.preAuthNumber }});
          }
        });
      }
      const chronicMedicationFormRenewal = this.model.chronicMedicationFormRenewals ? this.model.chronicMedicationFormRenewals[0] : null;
      if(chronicMedicationFormRenewal){
        form.deliveryMethod.setValue(chronicMedicationFormRenewal.deliveryMethod);
        form.postOfficeAddress.setValue(chronicMedicationFormRenewal.deliveryAddress);
        form.residentialAddress.setValue(chronicMedicationFormRenewal.deliveryAddress);
        this.model.preAuthChronicRequestTypeId =  PreAuthChronicRequestType.RenewalRequest;
        this.documentTypeFilter = [];
        this.documentTypeFilter.push(DocumentTypeEnum.DoctorsPrescriptionScript);
        this.documentTypeFilter.push(DocumentTypeEnum.RenewalofChronicApplicationFormOriginal);
        if(this.preAuthId > 0){
          this.documentKeyValue = this.preAuthId;
        }else{
          this.documentKeyValue = this.claimId;
        }
        this.healthCareProviderSearchComponent?.loadExistingAuthHealthcareProviderDetails(chronicMedicationFormRenewal.medicalServiceProviderId);
      }else{
        this.healthCareProviderSearchComponent.form.reset();
        this.documentKeyValue = 0;
      }
    }
  }

  onDeliveryMethodChange(event: any) {
    const form = this.form.controls;  
    form.postalAddress.setValue(null);
    form.postOfficeAddress.setValue(null);
    form.residentialAddress.setValue(null);

    const chronicMedicationForm = this.model.chronicMedicationForms ? this.model.chronicMedicationForms[0] : null;
    const chronicMedicationFormRenewal = this.model.chronicMedicationFormRenewals ? this.model.chronicMedicationFormRenewals[0] : null;
    
    if(chronicMedicationForm){
      if(event.value == DeliveryTypes.Collection && chronicMedicationForm.deliveryMethod == DeliveryTypes.Collection){
        form.postOfficeAddress.setValue(chronicMedicationForm.deliveryAddress);
      }else if(event.value == DeliveryTypes.Courier && chronicMedicationForm.deliveryMethod == DeliveryTypes.Courier){
        form.postOfficeAddress.setValue(chronicMedicationForm.deliveryAddress);
        form.residentialAddress.setValue(chronicMedicationForm.deliveryAddress);
      }      
    }

    if(chronicMedicationFormRenewal){
      if(event.value == DeliveryTypes.Collection && chronicMedicationFormRenewal.deliveryMethod == DeliveryTypes.Collection){
        form.postOfficeAddress.setValue(chronicMedicationFormRenewal.deliveryAddress);
      }else if(event.value == DeliveryTypes.Courier && chronicMedicationFormRenewal.deliveryMethod == DeliveryTypes.Courier){
        form.postOfficeAddress.setValue(chronicMedicationFormRenewal.deliveryAddress);
        form.residentialAddress.setValue(chronicMedicationFormRenewal.deliveryAddress);
      }  
    }
  }

  isRequiredDocumentsUploaded($event) {
    this.requiredDocumentsUploaded = $event;
   }

}
