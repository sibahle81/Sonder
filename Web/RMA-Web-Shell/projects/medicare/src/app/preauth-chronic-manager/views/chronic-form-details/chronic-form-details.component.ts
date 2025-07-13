import { Component, Input, OnInit } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import DateUtility from 'projects/digicare/src/app/digi-manager/Utility/DateUtility';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { ChronicMedicationForm  } from 'projects/medicare/src/app/preauth-manager/models/chronic-medication-form';
import { ChronicMedicationFormRenewal  } from 'projects/medicare/src/app/preauth-manager/models/chronic-renewal-medication-form';
import { ChronicMedicationHistory } from 'projects/medicare/src/app/preauth-manager/models/chronic-medical-history';
import { ChronicScriptMedicine } from 'projects/medicare/src/app/preauth-manager/models/chronic-script-medicine';
import { ChronicScriptMedicineRenewal } from 'projects/medicare/src/app/preauth-manager/models/chronic-script-medicine-renewal';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { Observable, of } from "rxjs";

 @Component({
  selector: 'chronic-form-details',
  templateUrl: './chronic-form-details.component.html',
  styleUrls: ['./chronic-form-details.component.css'],
})

export class ChronicFormDetailsComponent implements OnInit {

  @Input() chronicMedicationForms: ChronicMedicationForm[];
  @Input() chronicMedicationFormRenewals: ChronicMedicationFormRenewal[];
  

  chronicMedDetails$ : Observable<ChronicMedicationForm[]>;
  chronicMedRenewalDetails$ : Observable<ChronicMedicationFormRenewal[]>;
  chronicApplicationType: string;
  medicalHistoryColumns = ["icd10Code", "diagnosedDate", "treatment"];
  medicationColumns = ["condition", "icd10Code", "medicationPrescribed", "dosage", "numberOfRepeats"];
  medicalCurrentConditionColumns=["injuryRelatedProblem","iCD10Code","medicationPrescribed","dosage","numberOfRepeats"];
  medicalHistorySource : any = [];
  medicationSource : any = [];
  medicalCurrentConditionSource: any = [];
  healthCareProvider: HealthCareProvider;
  preAuthNumber: string='';

  constructor( private readonly HealthcareProviderService: HealthcareProviderService,
    private readonly mediCarePreAuthService: MediCarePreAuthService){}

  ngOnInit(): void {
      if(this.chronicMedicationForms && this.chronicMedicationForms?.length > 0){
        this.chronicApplicationType = 'ChronicMedicalForm';
        let  chronicMedicationForm =  this.chronicMedicationForms[0];
        let chronicMedicalHistories = chronicMedicationForm.chronicMedicalHistories;
        let chronicScriptMedicines = chronicMedicationForm.chronicScriptMedicines;

        if(chronicMedicalHistories.length > 0){
          chronicMedicalHistories.forEach(item => {
            const chronicMedicationHistory = new ChronicMedicationHistory();
            chronicMedicationHistory.disease = item['disease'];
            chronicMedicationHistory.dateDiagnosed = item['dateDiagnosed'] ?  DateUtility.getDate(item['dateDiagnosed'] ) : null;
            chronicMedicationHistory.treatment = item['treatment'];
            this.medicalHistorySource.push(chronicMedicationHistory);
         });
        }

        if(chronicScriptMedicines.length > 0){
          chronicScriptMedicines.forEach(item => {
            const chronicScriptMedicine = new ChronicScriptMedicine();
            chronicScriptMedicine.description  =  item['description'];
            chronicScriptMedicine.dosage = item['dosage'];
            chronicScriptMedicine.icd10Code = item['icd10Code'];
            chronicScriptMedicine.numberOfRepeats = item['numberOfRepeats'];
            chronicScriptMedicine.medicinePrescribed = item['medicinePrescribed'];            
            this.medicationSource.push(chronicScriptMedicine);
         });
         
        }

        if(!isNullOrUndefined(chronicMedicationForm.medicalServiceProviderId) && chronicMedicationForm.medicalServiceProviderId > 0){
 
          this.HealthcareProviderService.getHealthCareProviderById(chronicMedicationForm.medicalServiceProviderId).subscribe((result) => {
            if (result !== null && result.rolePlayerId > 0) {
              this.healthCareProvider = result;
            }
          });
        }
      
        this.chronicMedDetails$ = of(this.chronicMedicationForms);
       

      }else{

        this.chronicApplicationType = 'ChronicRenewalMedicalForm';
        let  chronicMedicationFormRenewal =  this.chronicMedicationFormRenewals[0];

        let chronicScriptMedicineRenewals = chronicMedicationFormRenewal.chronicScriptMedicineRenewals;

        if(chronicScriptMedicineRenewals.length > 0){
          chronicScriptMedicineRenewals.forEach(item => {
            const chronicScriptMedicineRenewal = new ChronicScriptMedicineRenewal();
            chronicScriptMedicineRenewal.description = item['description'];
            chronicScriptMedicineRenewal.dosage = item['dosage'];
            chronicScriptMedicineRenewal.icd10Code = item['icd10Code'];
            chronicScriptMedicineRenewal.numberOfRepeats = item['numberOfRepeats'];
            chronicScriptMedicineRenewal.medicinePrescribed = item['medicinePrescribed'];
            this.medicalCurrentConditionSource.push(chronicScriptMedicineRenewal);
         });
        }

        if(!isNullOrUndefined(chronicMedicationFormRenewal.medicalServiceProviderId) && chronicMedicationFormRenewal.medicalServiceProviderId > 0){
          this.HealthcareProviderService.getHealthCareProviderById(chronicMedicationFormRenewal.medicalServiceProviderId).subscribe((result) => {
            if (result !== null && result.rolePlayerId > 0) {
              this.healthCareProvider = result;
            }
          });
        }

        
        if(!isNullOrUndefined(chronicMedicationFormRenewal.authorisedChronicAuthorisationId) && chronicMedicationFormRenewal.authorisedChronicAuthorisationId > 0){
          this.mediCarePreAuthService.getPreAuthorisationById(chronicMedicationFormRenewal.authorisedChronicAuthorisationId).subscribe((item: PreAuthorisation) => {
            this.preAuthNumber = item.preAuthNumber;
          });
          }

        this.chronicMedRenewalDetails$ = of(this.chronicMedicationFormRenewals);

      }

      



  }
}