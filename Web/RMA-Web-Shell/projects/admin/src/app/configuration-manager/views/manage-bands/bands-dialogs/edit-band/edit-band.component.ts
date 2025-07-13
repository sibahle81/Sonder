import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuditLogComponent } from 'projects/shared-components-lib/src/lib/audit/audit-log.component';
import { AuditRequest } from 'projects/shared-components-lib/src/lib/audit/audit-models';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { CommissionBand } from '../../../../shared/commission-band';
import { CommissionBandService } from '../../../../shared/commission-band.service';
import { ItemType } from '../../../../shared/item-type.enum';

@Component({
  selector: 'app-edit-band',
  templateUrl: './edit-band.component.html',
  styleUrls: ['./edit-band.component.css']
})
export class EditBandComponent implements OnInit  {
commissionBand: CommissionBand;
commissionBands: CommissionBand[];
isMinSalaryVal = false;
isMaxSalaryVal = false;
@ViewChild(AuditLogComponent, { static: true }) auditLogComponent: AuditLogComponent;
constructor(public dialogRef: MatDialogRef<EditBandComponent>,
            @Inject(MAT_DIALOG_DATA) public data: any, public commissionBandService: CommissionBandService) { }

formControl = new UntypedFormControl('', [
  Validators.required
]);

ngOnInit() {
  this.commissionBand = this.data;
  this.getAuditDetails(this.data.commissionBandId, ServiceTypeEnum.MasterData, ItemType.CommissionBand);
  this.commissionBandService.getCommissionBands().subscribe(results=>{
    this.commissionBands = results;
 });
}

getErrorMessage() {
  return this.formControl.hasError('required') ? 'Required field' :
      '';
}

submit() {
}

onNoClick(): void {
  this.dialogRef.close();
}

stopEdit(): void {
  this.commissionBandService.editCommissionBand(this.data);
}

getAuditDetails(id: number, serviceType: number, itemType: number): void {
  const auditRequest = new AuditRequest(serviceType, itemType, id);
  this.auditLogComponent.getData(auditRequest);
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
