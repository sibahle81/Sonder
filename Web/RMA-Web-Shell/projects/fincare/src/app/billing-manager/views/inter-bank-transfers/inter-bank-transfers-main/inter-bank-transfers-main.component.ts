import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { InterBankTransferType } from 'projects/fincare/src/app/shared/enum/inter-bank-transfer-type-enum';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  selector: 'app-inter-bank-transfers-main',
  templateUrl: './inter-bank-transfers-main.component.html',
  styleUrls: ['./inter-bank-transfers-main.component.css']
})
export class InterBankTransfersMainComponent implements OnInit {
  requiredPermission = 'Interbank Transfers';
  hasPermission =false;
  form: UntypedFormGroup;
  fromSuspenseTransferType = InterBankTransferType.FromSuspense;
  fromDebtorTransferType = InterBankTransferType.FromDebtor;
  interBankTransferType : InterBankTransferType;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
  ) { }

  ngOnInit() {
    this.hasPermission = userUtility.hasPermission(this.requiredPermission);
    if (this.hasPermission) {
      this.activatedRoute.params.subscribe((params: any) => {
        this.createForm();
      });
    }
  }

  createForm()
  {
    this.form = this.formBuilder.group({
      TransferType: [{ value: null }, Validators.required],
    });
  }

  onTransferTypeSelected(transferType: InterBankTransferType)
  {
    this.interBankTransferType =transferType;
  }

}
