import { OnInit, Component, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { BrokerCommission } from '../../models/broker-commission';
import { BrokerStatementItem } from '../../models/broker-statement-item';
import { BrokerStatementComponent } from '../broker-statement/broker-statement.component';
import { BrokerPolicyService } from '../../services/broker-policy.service';
import { RepresentativeService } from '../../services/representative.service';

@Component({
    templateUrl: './broker-commission-list.component.html',
    styleUrls: ['./broker-commission-list.component.css']
})
export class BrokerCommissionListComponent implements OnInit {
    @ViewChild(BrokerStatementComponent, { static: true }) brokerStatement: BrokerStatementComponent;

    searchFormGroup: UntypedFormGroup;
    currentQuery: string;
    brokerCommissions: BrokerCommission[];
    isLoading: boolean;
    loadingMessage: string;
    displayBrokerStatement: boolean;

    disableBroker(commission: BrokerCommission): boolean {
        return commission.nmmberOfPolicies === 0;
    }

    get showNoResultsMessage(): boolean {
        return this.brokerCommissions.length === 0 && !this.isLoading;
    }

    get disableExport(): boolean {
        const validCommission = this.brokerCommissions.filter(x => x.exclude === false && x.commission > 0);
        return validCommission.length === 0;
    }

    constructor(private readonly formBuilder: UntypedFormBuilder,
                private readonly datePipe: DatePipe,
                private readonly commissionService: BrokerPolicyService,
                private readonly brokerService: RepresentativeService) {
        this.isLoading = false;
        this.brokerCommissions = new Array();
    }

    ngOnInit(): void {
        this.createForm();
        this.getBrokerageCommissionSummaries();
    }

    createForm(): void {
        if (this.searchFormGroup) { return; }
        this.searchFormGroup = this.formBuilder.group({ query: new UntypedFormControl('', [Validators.minLength(3), Validators.required]) });
    }

    readForm(): string {
        const formModel = this.searchFormGroup.value;
        return formModel.query as string;
    }

    search(): void {
        this.clear();
        this.getBrokerageCommissionSummaries();
    }

    clearSearch(): void {
        this.searchFormGroup.patchValue({ query: '' });
        this.clear();
        this.getBrokerageCommissionSummaries();
    }

    getBrokerageCommissionSummaries(): void {
        this.isLoading = true;
        this.loadingMessage = 'Loading brokerage commission summary...';
        this.commissionService.getBrokerageCommission(this.readForm()).subscribe(brokerageCommissionSummaries => {
            this.isLoading = false;
            this.loadingMessage = '';
            for (let i = 0; i < brokerageCommissionSummaries.length; i++) {
                const brokerageCommission = new BrokerCommission();
                brokerageCommission.brokerage = brokerageCommissionSummaries[i].brokerage;
                brokerageCommission.brokerageId = brokerageCommissionSummaries[i].brokerage.id;
                brokerageCommission.bankAccountId = brokerageCommissionSummaries[i].brokerage.bankAccountId;
                brokerageCommission.commission = brokerageCommissionSummaries[i].commission;
                brokerageCommission.nmmberOfPolicies = brokerageCommissionSummaries[i].nmmberOfPolicies;
                brokerageCommission.period = brokerageCommissionSummaries[i].period;
                brokerageCommission.exclude = false;
                brokerageCommission.excludeButtonText = 'Exclude';
                brokerageCommission.disableExclude = brokerageCommissionSummaries[i].nmmberOfPolicies === 0;
                brokerageCommission.brokerCommissionDetails = brokerageCommissionSummaries[i].brokerCommissionDetails;
                this.brokerCommissions.push(brokerageCommission);
            }
        });
    }

    getBroker(brokerId: number, detail: BrokerStatementItem): void {
        this.brokerService.getBroker(brokerId).subscribe(broker => {
            detail.broker = broker;
        });
    }

    getCurrentPeriod(): string {
        const date = new Date();
        return this.datePipe.transform(date, 'yyyyMM');
    }

    runCommission(): void {
        this.isLoading = true;
        this.loadingMessage = 'Processing Commission For Current Period...';
        this.commissionService.runCommission().subscribe(() => {
            this.isLoading = false;
            this.clear();
            this.getBrokerageCommissionSummaries();
        });
    }

    private clear() {
        this.brokerCommissions = new Array();
        this.displayBrokerStatement = false;
    }

    showBrokerStatement(brokerCommission: BrokerCommission) {
        this.displayBrokerStatement = true;
        this.brokerStatement.getBrokerage(brokerCommission);
    }

    excludeBroker(brokerCommission: BrokerCommission): void {
        if (brokerCommission) {
            brokerCommission.exclude = !brokerCommission.exclude;
            brokerCommission.excludeButtonText = brokerCommission.exclude ? 'Include' : 'Exclude';
        }
    }

    exportCommissionPayments(): void {
        this.isLoading = true;
        const brokerageIds = new Array<number>();
        const includedBrokerages = this.brokerCommissions.filter(b => b.exclude === false);
        includedBrokerages.forEach(b => {
            brokerageIds.push(b.brokerageId);
        });
        this.commissionService.exportCommissionPayments(brokerageIds.join(',')).subscribe(data => {
            const blob = new Blob([data], { type: 'text/plain;charset=utf-8;' });
            const link = document.createElement('a');
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', 'CommissionPayment.txt');
                // link.style = 'visibility:hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            this.isLoading = false;
        }, () => {
            this.isLoading = false;
        });
    }
}
