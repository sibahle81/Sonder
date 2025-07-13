import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommissionBand } from '../../../../shared/commission-band';
import { CommissionBandService } from '../../../../shared/commission-band.service';

@Component({
  selector: 'app-add-band',
  templateUrl: './add-band.component.html',
  styleUrls: ['./add-band.component.css']
})
export class AddBandComponent implements OnInit {
  commissionBands: CommissionBand[];
  isMinSalaryVal = false;
  isMaxSalaryVal = false;
  constructor(public dialogRef: MatDialogRef<AddBandComponent>,
              @Inject(MAT_DIALOG_DATA) public data: CommissionBand,
              public commissionBandService: CommissionBandService) { }

  formControl = new UntypedFormControl('', [
    Validators.required
  ]);

  ngOnInit() {
    this.commissionBandService.getCommissionBands().subscribe(results=>{
       this.commissionBands = results;
    });
  }

  getErrorMessage() {
    return this.formControl.hasError('required') ? 'Required field' :
           this.formControl.hasError('minSalaryVal') ? 'Salary Band must be over existing bands' :
        '';
  }

  submit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public confirmAdd(): void {
    this.commissionBandService.addBand(this.data);
  }

  validateMinSalaryBand($event: any) {
    var items = 100;
    if(this.commissionBands.length > 0){
      this.commissionBands.forEach(element => {
        if($event.target.value < element.maxSalaryBand)
          items -= 1;
      });
      if(items < 100){
        this.isMinSalaryVal = true;
      }else{
        this.isMinSalaryVal = false;
      }
   }
  }

   validateMaxSalaryBand($event: any) {
    var items = 100;
    if(this.commissionBands.length > 0){
      this.commissionBands.forEach(element => {
        if($event.target.value < element.maxSalaryBand)
          items -= 1;
      });
      if(items < 100){
        this.isMaxSalaryVal = true;
      }else{
        this.isMaxSalaryVal = false;
      }
   }
  }
}
