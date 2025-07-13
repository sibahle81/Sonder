import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Custom Validator Function
export function uniqueInputValidator(input: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const captured: string = control.value;

    if (!captured) {
      return null; // No validation error if the field is empty
    }

    // Validate values are not the same
    return captured.toUpperCase() === input.toUpperCase()
      ? { notUnique: { inputValue: input, capturedValue: captured } }
      : null;
  };
}
