import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MarketingcareApiService } from '../../services/marketingcare-api.service';
import { FormArray } from '@angular/forms';

@Component({
  selector: 'app-condition',
  templateUrl: './condition.component.html',
  styleUrls: ['./condition.component.css']
})

export class ConditionComponent implements OnInit, OnChanges {
  conditionDropDownOperators = [];
  form:FormGroup;
  valueArr = []
  entityArr = []
  patchValueArr = []
  errorMsg = ''
  updateValue;
  isSpinner: boolean = false

  constructor(private fb: FormBuilder, private api: MarketingcareApiService) { 
    this.form = this.fb.group({
      entity: ['', Validators.required],
      conditionOperator: [null, Validators.required],
      value: [null, [Validators.required, this.customValidator(this.index)]],
    })
     
  }

  @Input() entityDropdownValue = []
  @Input() isAgeSelected: boolean = false;
  @Input() conditionOperatorValue: string | null = null;

  @Input() index = 0
  @Output() selectedValues = new EventEmitter()
  @Input() patchValues = null
  @Input() isFormSubmited: boolean
  @Input() selectedValue: any
  @Input() formBuilder: FormBuilder;

  
  ngOnInit(): void {
    this.isSpinner=true;
    this.form?.get('entity')?.valueChanges.subscribe(() => {
      this.form?.get('value')?.updateValueAndValidity();
      this.form?.get('conditionOperator')?.updateValueAndValidity();
      this.isSpinner=false;
    });
    this.form.valueChanges.subscribe((dt) => {
      this.emitData();
      this.isSpinner=false;

        });
  }
  private customValidator(index: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const currentEntityValue = control.get('entity')?.value;
      
      if (index > 0) {
        const previousEntityValue = (control.parent as FormArray).at(index - 1).get('entity')?.value;
        const previousValue = (control.parent as FormArray).at(index - 1).get('value')?.value;
  
        if (currentEntityValue === previousEntityValue && control.get('value')?.value === previousValue) {
          return { duplicateValueError: true };
        }
      }
  
      return null;
    };
  }
 
  ngOnChanges(changes: SimpleChanges) {
    this.isSpinner=true;
    if (changes.conditionOperatorValue && changes.conditionOperatorValue.currentValue) {
      this.form.get('conditionOperator').setValue(changes.conditionOperatorValue.currentValue);
      this.isSpinner=false;
    }
    if (changes.entityDropdownValue) {
      this.entityArr = changes.entityDropdownValue.currentValue;
      this.isSpinner=false;
    }
   
    if (changes.patchValues) {
      const patchValues = changes.patchValues.currentValue;
      this.patchValueArr = patchValues?.groupList || [];
    
      if (this.patchValueArr.length > 0) {
        this.addValues();
      }
      this.isSpinner=false;
    }
    if (changes.isFormSubmited) {
      this.isFormSubmited = changes.entityDropdownValue?.currentValue;
      this.updateFormValidity();
      this.isSpinner=false;
    }
    if (changes.selectedValue) {
      this.selectedValue = changes.entityDropdownValue.currentValue;
      this.isSpinner=false;
    }
   
    if (changes.isFormSubmited) {
      this.isFormSubmited = changes.isFormSubmited.currentValue;
      this.updateFormValidity();
      this.isSpinner=false;
    }
   
  }
  private updateFormValidity() {
    this.isSpinner=true;
    if (this.isFormSubmited) {
      Object.values(this.form.controls).forEach(control => {
        control.updateValueAndValidity();
      });
      this.isSpinner=false;
    }
  }
  validateEntity() {
    this.form?.get('entity').markAsTouched();
    return this.form?.get('entity').invalid;
  }

  validateonditionOperator() {
    return this.form?.get('conditionOperator').invalid;
  }

  validateValue() {
    return this.form?.get('value').invalid;
  }

  emitData() {
    this.isSpinner=true;
    if (this.form.valid) {
      this.selectedValues.emit({ values: this.form.value, index: this.index });
      this.isSpinner=false;
    }
  }


  addValues() {
    this.isSpinner=true;
    const { entity, conditionOperator, value, operator } = this.patchValueArr[this.index] || {};

    this.form.patchValue({
      entity: entity || '',
      conditionOperator: conditionOperator || null,
      value: value || null,
      operator: operator || null  
    });
  
    this.conditionDropdown(entity);
 
    this.getValueDropdownList(this.patchValueArr[this.index]?.entity)
    if (entity === 'Age') {
      this.getValueDropdownList(entity);
      this.isSpinner=false;
    }
    this.isAgeSelected = this.patchValueArr[this.index]?.entity === 'Age';

  }

  onInputChange(name: string) {
    this.isAgeSelected = name === 'Age';


    this.conditionDropdown(name)
    this.getValueDropdownList(name)
  }

  checkAge(event: any) {
    const age = event.target.value
    if (age > 150) {
      this.errorMsg = 'Please add correct age'
    }
  }

  conditionDropdown(value: string) {
    const tempArr = this.entityArr.find(dt => dt.entityName == value)?.entityCondition.split('|')
    this.conditionDropDownOperators = tempArr


    if (this.conditionDropDownOperators) {
      this.updateConditionFieldValue();
    } else {
      this.updateValue = {
        conditionOperator: null
      }
    }
  }

  updateConditionFieldValue() {
    const currentConditionOperator = this.form.get('conditionOperator')?.value;
  
    if (currentConditionOperator && !this.conditionDropDownOperators.includes(currentConditionOperator)) {
      this.form.patchValue({
        conditionOperator: null
      });
    }
  
    if (!this.form.get('conditionOperator')?.value) {
      this.form.patchValue({
        conditionOperator: this.conditionDropDownOperators[0]
      });
    }
  }
  
  getValueDropdownList(option: string) {
    this.api.getMarketingCareGroupConditionEntityDetails(option).subscribe((res) => {
      this.isSpinner = true;

      if (res) {
       this.isSpinner= false;

        this.valueArr = res['data']
      }
    })
  }
 
}
