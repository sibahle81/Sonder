// dob.validator.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Custom Validator Function
export function minYearsValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const dob = control.value;

    if (!dob) {
      return null; // No validation error if the field is empty
    }

    const dobDate = new Date(dob);
    const today = new Date();

    // Calculate age
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }

    // Validate age
    return age < minAge ? { underage: { requiredAge: minAge, actualAge: age } } : null;
  };
};
