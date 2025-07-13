import { Injectable } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { BehaviorSubject} from 'rxjs';
import { ClaimDisabilityAssessment } from '../../entities/claim-disability-assessment';

@Injectable({
  providedIn: 'root'
})
export class DisabilityFormService {

  private formArray: FormArray = new FormArray([]);

  public claimDisabilityAssessment: BehaviorSubject<ClaimDisabilityAssessment[]> = new BehaviorSubject([]);
  public refresh$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public activatePensionInterview$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  addForm(formGroup: FormGroup) {
    this.formArray.push(formGroup);
  }

  allValid(): boolean {
    return this.formArray.valid;
  }

  isValidSave(): boolean {
    return this.formArray.valid && !this.formArray.pristine;
  }

  formInvalid(): boolean {
    return !this.formArray.valid && this.formArray.pristine;
  }
  
  getGenericForm() {
    const index = this.formArray.controls.length > 1 ? 1 : 0; 
    return this.formArray.controls[index].getRawValue();
  }

  populateDisabilityAssessment(disabilityAssessment: ClaimDisabilityAssessment[]) {
    this.claimDisabilityAssessment.next(disabilityAssessment);
  }

  activatePensionInterview() {
    this.activatePensionInterview$.next(true);
  }
}
