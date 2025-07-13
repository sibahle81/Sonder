import { Component, OnInit } from '@angular/core';
import { LedgerBankingDetail } from 'projects/shared-components-lib/src/lib/models/ledger-banking-details.model';
import { MultipleBankingDetailNotification } from 'projects/shared-components-lib/src/lib/models/multiple-banking-detail-notification.model';
import { BankAccountTypeEnum } from 'projects/shared-models-lib/src/lib/enums/bank-account-type-enum';

@Component({
  selector: 'app-view-multiple-banking-details',
  templateUrl: './view-multiple-banking-details.component.html',
  styleUrls: ['./view-multiple-banking-details.component.css']
})
export class ViewMultipleBankingDetailsComponent implements OnInit {
  model: MultipleBankingDetailNotification;

  constructor() { }

  ngOnInit(): void {
    this.getBankingMulitpleDetails();
  }

  getBankingMulitpleDetails(): void {
    this.model = {
      bankingDetailList: [
        {
          accountHolderName: 'Joe',
          accountHolderSurname: 'Blogs',
          bankId: 1,
          branchCode: '44558',
          accountType: BankAccountTypeEnum.ChequeAccount,
          rolePlayerId: '22033',
          accountNumber: '409955667',
          bankBranchId: 1,
          bankName: 'ABSA',
          idNumber: '7609120999090',
          ledgerId: 1,
          pensionCaseNumber: 'F00001'
        },
        {
          accountHolderName: 'Joe',
          accountHolderSurname: 'Blogs',
          bankId: 1,
          branchCode: '44558',
          accountType: BankAccountTypeEnum.ChequeAccount,
          rolePlayerId: '22033',
          accountNumber: '409955667',
          bankBranchId: 1,
          bankName: 'ABSA',
          idNumber: '7609120999090',
          ledgerId: 1,
          pensionCaseNumber: 'F00001'
        },
        {
          accountHolderName: 'Joe',
          accountHolderSurname: 'Blogs',
          bankId: 1,
          branchCode: '44558',
          accountType: BankAccountTypeEnum.ChequeAccount,
          rolePlayerId: '22033',
          accountNumber: '409955667',
          bankBranchId: 1,
          bankName: 'ABSA',
          idNumber: '7609120999090',
          ledgerId: 1,
          pensionCaseNumber: 'F00001'
        }
      ] as LedgerBankingDetail[]
    }
  }
}
