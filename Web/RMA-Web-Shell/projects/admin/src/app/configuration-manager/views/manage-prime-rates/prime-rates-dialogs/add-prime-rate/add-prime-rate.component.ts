import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PrimeRate } from '../../../../shared/prime-rate';
import { PrimeRateService } from '../../../../shared/prime-rate.service';

@Component({
  selector: 'app-add-prime-rate',
  templateUrl: './add-prime-rate.component.html',
  styleUrls: ['./add-prime-rate.component.css']
})
export class AddPrimeRateComponent implements OnInit {
  primeRates: PrimeRate[];
  isMinSalaryVal = false;
  isMaxSalaryVal = false;
  form: UntypedFormGroup;
  public startDate = new Date();
  
  constructor(public dialogRef: MatDialogRef<AddPrimeRateComponent>,
             private readonly formBuilder: UntypedFormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: PrimeRate,
              public primeRateService: PrimeRateService) { }

  ngOnInit() {
   
    this.createForm(0);
    this.primeRateService.getHistory().subscribe(results=>{
       this.primeRates = results;

    });
  }

  createForm(id: any): void {
    this.startDate.setHours(0, 0, 0, 0);
    this.form = this.formBuilder.group({
        id,
        value: new UntypedFormControl('', [Validators.required, Validators.min(0), Validators.max(100)]),
        startDate: new UntypedFormControl(this.startDate, Validators.required)
    });
}
  
  startDateChange(value: Date) {
    this.startDate = value;
}

  submit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public confirmAdd(): void {

    this.data.startDate = this.startDate;
    this.data.endDate = new Date();
    this.data.endDate.setHours(0,0,0,0);
    this.data.endDate.setFullYear( new Date().getFullYear() + 5,11,31);

    this.data.value = this.form.get('value').value;
    this.primeRateService.addRate(this.data);
  }


}
