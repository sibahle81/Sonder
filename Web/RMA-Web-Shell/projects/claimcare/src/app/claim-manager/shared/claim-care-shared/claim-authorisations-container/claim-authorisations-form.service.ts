import { Injectable } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { BehaviorSubject} from 'rxjs';
import { SundryProvider } from '../claim-invoice-container/invoice-sundry/sundry-provider';

@Injectable({
  providedIn: 'root'
})
export class AuthorisationsFormService {

  private formArray: FormArray = new FormArray([]);
  public sundryProviders: BehaviorSubject<SundryProvider[]> = new BehaviorSubject([]);
  public refresh$: BehaviorSubject<boolean> = new BehaviorSubject(false);

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
    return this.formArray.controls[1].getRawValue();
  }

  populateSundryProviders(sundryProviders: SundryProvider[]) {
    this.sundryProviders.next(sundryProviders);
  }
}
