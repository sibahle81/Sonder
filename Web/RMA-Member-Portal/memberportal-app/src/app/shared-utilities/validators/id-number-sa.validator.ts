import { AbstractControl } from '@angular/forms';

export function ValidateSAIdNumber(control: AbstractControl) {
  if (control == null || control.value == null || control.value === '') { return null; }

  const idNumber = control.value;
  let errors = '';

  // assume everything is correct and if it later turns out not to be, just set this to false
  let correct = true;

  // Ref: http://www.sadev.co.za/content/what-south-african-id-number-made
  // SA ID Number have to be 13 digits, so check the length
  if (idNumber.length !== 13 || !isNumber(idNumber)) {
    //  error.append('<p>ID number does not appear to be authentic - input not a valid number</p>');
    correct = false;
    return { idNumber: true };
  }

  // get first 6 digits as a valid date
  const tempDate = new Date(idNumber.substring(0, 2), idNumber.substring(2, 4) - 1, idNumber.substring(4, 6));

  const id_date = tempDate.getDate();
  const id_month = tempDate.getMonth();
  const id_year = tempDate.getFullYear();

  const fullDate = id_date + '-' + id_month + 1 + '-' + id_year;
  const id_date2 = parseInt(idNumber.substring(4, 6), 10);
  const temp_year = parseInt(idNumber.substring(0, 2), 10);
  const yearcompare = parseInt(tempDate.getFullYear().toString().substring(2), 10);

  if (!((yearcompare === temp_year) && (id_month === idNumber.substring(2, 4) - 1) && (id_date === id_date2))) {
    correct = false;
    return { idNumber: true };
  }

  // get the gender
  const genderCode = idNumber.substring(6, 10);
  const gender = parseInt(genderCode) < 5000 ? 'Female' : 'Male';

  // get country ID for citzenship
  const citzenship = parseInt(idNumber.substring(10, 11)) === 0 ? 'Yes' : 'No';

  // apply Luhn formula for check-digits
  let tempTotal = 0;
  let checkSum = 0;
  let multiplier = 1;
  for (let i = 0; i < 13; ++i) {
    tempTotal = parseInt(idNumber.charAt(i)) * multiplier;
    if (tempTotal > 9) {
      tempTotal = parseInt(tempTotal.toString().charAt(0)) + parseInt(tempTotal.toString().charAt(1));
    }
    checkSum = checkSum + tempTotal;
    multiplier = (multiplier % 2 === 0) ? 1 : 2;
  }
  if ((checkSum % 10) !== 0) {
    errors = 'ID number does not appear to be authentic - check digit is not valid';
    return { idNumber: true };
  }

  if (correct) {
    // and put together a result message
    errors = 'South African ID Number:   ' + idNumber + '</p><p>Birth Date:   ' + fullDate + '</p><p>Gender:  ' + gender + '</p><p>SA Citizen:  ' + citzenship;
    return null;
  } else {
    return { idNumber: true };
  }

  function isNumber(n: number) {
    return !isNaN(n) && isFinite(n);
  }
}
