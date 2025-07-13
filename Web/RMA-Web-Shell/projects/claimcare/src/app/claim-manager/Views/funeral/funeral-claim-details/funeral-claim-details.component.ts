import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';

@Component({
  selector: 'app-funeral-claim-details',
  templateUrl: './funeral-claim-details.component.html',
  styleUrls: ['./funeral-claim-details.component.css']
})
export class FuneralClaimDetailsComponent implements OnInit {

  deceasedDetailsFormGroup = new UntypedFormGroup({
    firstName: new UntypedFormControl(''),
    lastName: new UntypedFormControl(''),
    idPassPort: new UntypedFormControl(''),
    dateOfBirth: new UntypedFormControl(''),
    typeOfDeath: new UntypedFormControl(''),
    causeOfDeath: new UntypedFormControl(''),
    gender: new UntypedFormControl(''),
    nationalityOfDeceased: new UntypedFormControl(''),
    dhaRefNo: new UntypedFormControl(''),
    deathCertificateRefNo: new UntypedFormControl(''),
    dateOfDeath: new UntypedFormControl(''),
    dateNotified: new UntypedFormControl('')
  });

  informantDetailsFormGroup = new UntypedFormGroup({
    inFirstName: new UntypedFormControl(''),
    inLastName: new UntypedFormControl(''),
    inIdNo: new UntypedFormControl(''),
    inPassPortNo: new UntypedFormControl(''),
    inContatNo: new UntypedFormControl(''),
    relationtoDeceased: new UntypedFormControl(''),
    inDateOfBirth: new UntypedFormControl('')
  });


  medicalPractitionerDetailsFormGroup = new UntypedFormGroup({
    typeofMedPract: new UntypedFormControl(''),
    mpFirstName: new UntypedFormControl(''),
    mpLastName: new UntypedFormControl(''),
    mpContactNo: new UntypedFormControl(''),
    mpRegNo: new UntypedFormControl('')
  });

  forensicPathologistFormGroup = new UntypedFormGroup({
    firstName: new UntypedFormControl(''),
    lastName: new UntypedFormControl(''),
    hspmortName: new UntypedFormControl(''),
    contactNo: new UntypedFormControl(''),
    idOfBodyNo: new UntypedFormControl(''),
    postMortNo: new UntypedFormControl(''),
    sapsCaseNo: new UntypedFormControl(''),
    forensicRegNo: new UntypedFormControl(''),
    dateOfPostMort: new UntypedFormControl('')
  });

  funeralParlorFormGroup = new UntypedFormGroup({
    fpName: new UntypedFormControl(''),
    fpRegNo: new UntypedFormControl(''),
    fpAddr1: new UntypedFormControl(''),
    fpAddr2: new UntypedFormControl(''),
    fpAddr3: new UntypedFormControl(''),
    fpContactNo: new UntypedFormControl('')
  });

  underTakerFormGroup = new UntypedFormGroup({
    utFirstName: new UntypedFormControl(''),
    utLastName: new UntypedFormControl(''),
    utIdNo: new UntypedFormControl(''),
    utPassNo: new UntypedFormControl(''),
    utDateOfBirth: new UntypedFormControl(''),
    utContactNo: new UntypedFormControl(''),
    placeOfBurial: new UntypedFormControl(''),
    dateOfBurial: new UntypedFormControl('')
  });

  bodyCollectorFormGroup = new UntypedFormGroup({
    bcFirstName: new UntypedFormControl(''),
    bcLastName: new UntypedFormControl(''),
    bcIdNo: new UntypedFormControl(''),
    bcPassNo: new UntypedFormControl(''),
    bcDateOfBirth: new UntypedFormControl(''),
    bcContactNo: new UntypedFormControl(''),
    bodyCollectionDate: new UntypedFormControl('')
  });

  documentsFormGroup = new UntypedFormGroup({
    bcFirstName: new UntypedFormControl('')
  });

  notesFormGroup = new UntypedFormGroup({
    claimNotes: new UntypedFormControl('')
  });

  constructor() { }

  ngOnInit() {
  }
}
