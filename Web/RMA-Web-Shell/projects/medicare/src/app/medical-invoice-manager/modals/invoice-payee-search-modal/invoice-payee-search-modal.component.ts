import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';
import { BehaviorSubject } from 'rxjs';
import { MedicareUtilities } from '../../../shared/medicare-utilities';

@Component({
  selector: 'app-invoice-payee-search-modal',
  templateUrl: './invoice-payee-search-modal.component.html',
  styleUrls: ['./invoice-payee-search-modal.component.css']
})
export class InvoicePayeeSearchModalComponent {


  payeeTypeHeader
  loading$ = new BehaviorSubject<boolean>(true);
  rolePlayerIdentificationTypes
  rolePlayerSelected: RolePlayer

  constructor(
    public dialogRef: MatDialogRef<InvoicePayeeSearchModalComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,

  ) {
  }

  ngOnInit(): void {

  }

  closeDialog(returnedData) {
    this.dialogRef.close(returnedData);
  }

  setRolePlayer(rolePlayer: RolePlayer) {
    this.rolePlayerSelected = rolePlayer;
    this.dialogRef.close(this.rolePlayerSelected);
  }


}
