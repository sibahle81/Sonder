import { Component, OnInit } from '@angular/core';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Router } from '@angular/router';
import { BrokerStatementDataSource } from '../../datasources/broker-statement.datasource';
import { Brokerage } from '../../models/brokerage';
import { BankAccountService } from '../../services/bank-account.service';
import { BankAccount } from '../../models/bank-account';
import { Bank } from '../../../../../../shared-models-lib/src/lib/lookup/bank';
import { BankService } from '../../../../../../shared-services-lib/src/lib/services/lookup/bank.service';
import { BankAccountType } from '../../../../../../shared-models-lib/src/lib/lookup/bank-account-type';
import { BankAccountTypeService } from '../../../../../../shared-services-lib/src/lib/services/lookup/bank-account-type.service';
import { BrokerStatementItem } from '../../models/broker-statement-item';
import { DatePipe } from '@angular/common';
import { BrokerCommission } from '../../models/broker-commission';
import { ListFilteredComponent } from 'projects/shared-components-lib/src/lib/list-filtered-component/list-filtered.component';

@Component({
    styleUrls: ['./broker-statement.component.css'],
    templateUrl: './broker-statement.component.html',
    selector: 'broker-statement'
})
export class BrokerStatementComponent extends ListFilteredComponent implements OnInit {

    brokerage: Brokerage;
    commission: BrokerCommission;

    isBrokerLoading: boolean;

    get commissionBalance(): number {
        if (this.brokerStatementDataSource) {
            return this.brokerStatementDataSource.commissionBalance;
        }
        return 0;
    }

    constructor(private readonly bankAccountService: BankAccountService,
        private readonly bankService: BankService,
        private readonly bankAccountTypeService: BankAccountTypeService,
        private alertService: AlertService,
        router: Router,
        private brokerStatementDataSource: BrokerStatementDataSource,
        private readonly datePipe: DatePipe) {
        super(router, brokerStatementDataSource, '', 'Broker Statement', 'Broker Statements');
        this.initialize();
    }

    private initialize(): void {
        this.isBrokerLoading = false;
        this.brokerage = new Brokerage();
        this.showActionsLink = false;
    }

    ngOnInit(): void {
        super.ngOnInit();
    }

    getBrokerage(commission: BrokerCommission): void {
        commission.brokerage.bankAccount = new BankAccount();
        commission.brokerage.bank = new Bank();
        commission.brokerage.bankAccountType = new BankAccountType();
        this.commission = commission;
        this.brokerage = commission.brokerage;
        this.getBrokerageBankAccount(this.brokerage.bankAccountId);
        this.brokerStatementDataSource.getData(commission.brokerCommissionDetails);
    }

    getBrokerageBankAccount(bankAccountId: number): void {
        this.bankAccountService.getBankAccount(bankAccountId).subscribe(bankAccount => {
            this.brokerage.bankAccount = bankAccount;
            if (this.brokerage.bankAccount && this.brokerage.bankAccount.bankId > 0) {
                this.getBankAcountBank(this.brokerage.bankAccount.bankId);
            }
            if (this.brokerage.bankAccount && this.brokerage.bankAccount.accountTypeId > 0) {
                this.getBankAccountType(this.brokerage.bankAccount.accountTypeId);
            }
        }, () => {
            this.isBrokerLoading = false;
        });
    }

    getBankAcountBank(bankId: number): void {
        if (bankId !== undefined && bankId > 0) {
            this.bankService.getBank(bankId).subscribe(bank => {
                this.brokerage.bank = bank;
                this.isBrokerLoading = false;
            }, error => {
                //this.alertService.handleError(error);
                this.isBrokerLoading = false;
            });
        } else {
            this.isBrokerLoading = false;
        }
    }

    getBankAccountType(banoAccountTypeId: number): void {
        this.bankAccountTypeService.getBankAccountType(banoAccountTypeId).subscribe(bankAccountType => {
            this.brokerage.bankAccountType = bankAccountType;
        },
            () => {
                this.isBrokerLoading = false;
            });
    }

    setupDisplayColumns(): void {
        this.columns = [
            { columnDefinition: 'membershipNumber', header: 'POLICY NO', cell: (row: BrokerStatementItem) => `${row.policyNumber}` },
            { columnDefinition: 'memberName', header: 'CLIENT NAME', cell: (row: BrokerStatementItem) => `${row.memberName}` },
            { columnDefinition: 'broker', header: 'BROKER', cell: (row: BrokerStatementItem) => `${(row.broker.name ? row.broker.name.trim() : '') + ' ' + (row.broker.surnameOrCompanyName ? row.broker.surnameOrCompanyName.trim() : '')}` },
            { columnDefinition: 'joinDate', header: 'JOIN DATE', cell: (row: BrokerStatementItem) => `${this.datePipe.transform(row.memberJoinDate, 'yyyy-MM-dd')}` },
            { columnDefinition: 'paidForMonth', header: 'PAID FOR MONTH', cell: (row: BrokerStatementItem) => `${row.paidForMonth}` },
            { columnDefinition: 'premium', header: 'PREMIUM', cell: (row: BrokerStatementItem) => `R ${row.premium.toFixed(2)}` },
            { columnDefinition: 'clawbacks', header: 'CLAWBACKS', cell: (row: BrokerStatementItem) => `R ${row.clawback.toFixed(2)}` },
            { columnDefinition: 'commissionPercentage', header: 'COMMISSION %', cell: (row: BrokerStatementItem) => `${row.commissionPercentage.toFixed(2)}%` },
            { columnDefinition: 'commission', header: 'COMMISSION', cell: (row: BrokerStatementItem) => `R ${row.commission.toFixed(2)}` },
            { columnDefinition: 'retentionPercentage', header: 'RETAINED %', cell: (row: BrokerStatementItem) => `${row.retentionPercentage.toFixed(2)}%` },
            { columnDefinition: 'retentionAmount', header: 'RETAINED AMOUNT', cell: (row: BrokerStatementItem) => `R ${row.retentionAmount.toFixed(2)}` }
        ];
    }

    onSelect(item: BrokerStatementItem): void {

    }

    download() {
        const data = this.brokerStatementDataSource.data;
        const fileName = this.brokerage.name.trim() + '_commission_statement.csv';
        const csvData = data.map(row => this.transformRow(row));
        csvData.unshift(this.getHeaderRow());
        const blob = new Blob(csvData, { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        if (navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, fileName);
        } else {
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        window.URL.revokeObjectURL(url);
    }

    transformRow(statement: BrokerStatementItem): string {

        const broker = (statement.broker.name ? statement.broker.name.trim() : '') + ' ' + (statement.broker.surnameOrCompanyName ? statement.broker.surnameOrCompanyName.trim() : '');
        const joinDate = this.datePipe.transform(statement.memberJoinDate, 'yyyy-MM-dd');
        let row =
            `${statement.policyNumber},${statement.memberName},${broker},${joinDate},${statement.paidForMonth},${
            statement.premium},${statement.clawback},${statement.commissionPercentage},${
            statement.commission},${statement.retentionPercentage},${statement.retentionAmount}`;
        row += '\r\n';

        return row;
    }

    private getHeaderRow(): string {
        let row = ' ,POLICY NO, CLIENT NAME, BROKER, JOIN DATE, PAID FOR MONTH, PREMIUM, CLAWBACKS, COMMISSION %, COMMISSION, RETAINED %, RETAINED AMOUNT';
        row += '\r\n';
        return row;
    }
}
