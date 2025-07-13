import { Component, OnInit, Input } from '@angular/core';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Statement } from '../../../shared/models/statement';

@Component({
  selector: 'account-history',
  templateUrl: './account-history.component.html',
  styleUrls: ['./account-history.component.css']
})
export class AccountHistoryComponent implements OnInit {
  @Input() rolePlayerId: number;
  statements: Statement[];
  isLoadingAccount = 0;
  constructor(
    private readonly appEventsManager: AppEventsManager,
    private readonly invoiceService: InvoiceService,
    private readonly alertService: AlertService
  ) { 
  }

  ngOnInit() {
    console.log(this.rolePlayerId);
    this.invoiceService.getStatementByRolePlayer(this.rolePlayerId).subscribe(statements=>{
      console.log(statements);
      this.statements = statements;
      this.isLoadingAccount = 1;
    })
  }

}
