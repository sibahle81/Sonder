import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, } from '@angular/material/dialog';
import { TracerModel } from '../../shared/entities/tracer-model';
import { BehaviorSubject } from 'rxjs';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ClaimCareService } from '../../Services/claimcare.service';
import { TraceDetailsComponent } from './trace-details/trace-details.component';
import { ClaimTracerPaymentModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/tracer-model';
import { DatePipe } from '@angular/common';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { TraceInvoiceComponent } from './trace-invoice/trace-invoice.component';
import { BankAccountTypeEnum } from 'projects/shared-models-lib/src/lib/enums/bank-account-type-enum';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';

@Component({
    selector: 'tracer-list',
    templateUrl: './tracer-list.component.html',
    styleUrls: ['./tracer-list.component.css']
})
export class TracerListComponent implements OnInit {

    @Input() claimId = 0;

    menus: { title: string; url: string; disable: boolean }[];
    wizardTypeTracer = 'funeral-tracing';
    createTracerDetailsType = 'Create Tracer Detail';
    createBankingDetailsType = 'Add Banking Detail';
    updateBankingDetailsType = 'Update Banking Detail';
    hasTracerWizard = false;
    claimStatus = false;
    UpdateRolePlayerId: number;
    AddBankingRolePlayerId: number;
    rolePlayerBankId: number;
    totalAmount: number;
    maxAmount: number;
    tracerList: TracerModel[] = [];
    claimTracerPaymentModel = new ClaimTracerPaymentModel();
    bankAccountType = BankAccountTypeEnum;

    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    displayTracerColumns = ['name', 'surname', 'identificationNumber', 'nameOfAccountHolder', 'accountNumber', 'accountType', 'bankName', 'totalAmountPaid', 'funeralTracingMaxAmount', 'actions'];

    constructor(
        public dialog: MatDialog,
        public readonly router: Router,
        private readonly wizardService: WizardService,
        private readonly confirmservice: ConfirmationDialogsService,
        private readonly alertService: AlertService,
        private readonly datePipe: DatePipe,
        private readonly lookup: LookupService,
        private readonly claimService: ClaimCareService) {
    }

    ngOnInit(): void {
        if (this.claimId > 0) {
            this.getData(this.claimId);
            this.getClaimStatus();
        }
    }

    getData(claimId: number): void {
        this.isLoading$.next(true);

        // Get method then call the below
        this.claimService.getTracerDetails(claimId).subscribe(
            data => {
                if (data.rolePlayer !== null) {
                    if (data.rolePlayer.person.idType === 2) { data.rolePlayer.person.idNumber = data.rolePlayer.person.passportNumber }
                    this.tracerList = [];
                    this.tracerList.push(data);
                    if (data.rolePlayer.rolePlayerBankingDetails.length > 0) {
                        this.tracerList[0].rolePlayerBankingDetails = data.rolePlayer.rolePlayerBankingDetails[0];
                        this.getBankBranch();
                    } else {
                        const roleBanking = new RolePlayerBankingDetail();
                        roleBanking.rolePlayerBankingId = 0;
                        this.tracerList[0].rolePlayerBankingDetails = roleBanking;
                    }
                    this.totalAmount = data.totalAmountPaid;
                    this.maxAmount = data.funeralTracingMaxAmount;
                    this.hasTracerWizard = data.rolePlayer.rolePlayerId ? true : false;
                    this.isLoading$.next(false);
                } else { this.isLoading$.next(false); }
            },
            error => {
                this.alertService.error(error.message); this.isLoading$.next(false);
            });
    }

    viewWizard() {
        this.wizardService.getWizardsByTypeAndLinkedItemId(this.claimId, this.wizardTypeTracer).subscribe(wizard => {
            if (wizard) {
                this.router.navigateByUrl(`/claimcare/claim-manager/funeral-tracing/continue/${wizard.id}`);
            } else { this.addConfirmation(this.createTracerDetailsType); }
        });
    }

    addConfirmation(type: string): void {
        this.confirmservice.confirmWithoutContainer(type, ` Are you sure you want to add a ${type}?`,
            'Center', 'Center', 'Yes', 'No').subscribe(
                result => {
                    if (result === true && type === this.createTracerDetailsType) {
                        this.createTracerDetailsWizard();
                    }
                    if (result === true && type === this.updateBankingDetailsType) {
                        this.updateBankingDetailsWizard(this.rolePlayerBankId, this.UpdateRolePlayerId);
                    }
                    if (result === true && type === this.createBankingDetailsType) {
                        this.createBankingDetailsWizard(this.AddBankingRolePlayerId);
                    }
                });
    }

    // Kick start the wizard for creating Tracing details
    createTracerDetailsWizard() {
        const request = new StartWizardRequest();
        request.type = 'funeral-tracing';
        request.linkedItemId = this.claimId;
        this.wizardService.startWizard(request).subscribe(wizard => {
            this.router.navigateByUrl(`/claimcare/claim-manager/funeral-tracing/continue/${wizard.id}`);
        });
    }

    onSelect(item: TracerModel): void {
    }

    getClaimStatus(): void {
        this.claimService.getClaimById(this.claimId).subscribe(claim => {
            this.claimStatus = claim.claimStatusId === ClaimStatusEnum.Tracing ? true : false;
        })
    }

    getBankBranch() {
        this.lookup.getBankBranches().subscribe(result => {
            result.forEach(bank => {
                if (bank.id == this.tracerList[0].rolePlayerBankingDetails.bankBranchId) {
                    this.tracerList[0].rolePlayerBankingDetails.bankName = bank.bank.name;
                }
            });
        });
    }

    back() {

    }

    openDialog(): void {
        const leftOverAmount = this.maxAmount - this.totalAmount;

        const dialog = this.dialog.open(TraceDetailsComponent, {
            width: '800px',
            height: 'auto',
            data: leftOverAmount
        });
        dialog.afterClosed().subscribe(result => {
            this.isLoading$.next(true);
            if (result) {
                this.claimTracerPaymentModel.claimId = this.claimId;
                this.claimTracerPaymentModel.rolePlayerId = this.UpdateRolePlayerId;
                this.claimTracerPaymentModel.bankAccountId = this.rolePlayerBankId;
                this.claimTracerPaymentModel.payDate = this.datePipe.transform(result.date, 'yyyy-MM-dd');
                this.claimTracerPaymentModel.tracingFee = result.amount;
                this.claimService.AuthorizeTracerPayment(this.claimTracerPaymentModel).subscribe(result => {
                    if (result) {
                        this.alertService.success('Payment success');
                        this.isLoading$.next(false);
                        this.ngOnInit();
                    } else {
                        this.alertService.error('Payment failed');
                    }
                });
            } else {this.isLoading$.next(false);}
        });
    }

    openInvoiceDialog(claimId: number): void {
        this.claimService.getTracerInvoices(claimId).subscribe(invoices => {
            const dialog = this.dialog.open(TraceInvoiceComponent, {
                data: invoices,
                width: '800px',
                height: 'auto',
            });
            dialog.afterClosed().subscribe(result => {
                if (result) {

                }
            });
        })
    }

    filterMenu(item: any) {
        if (this.tracerList[0].rolePlayerBankingDetails.rolePlayerBankingId === 0) {
            this.menus = [
                { title: 'Add Banking Detail', url: '', disable: false },
                { title: 'View Invoices', url: '', disable: false },
            ];
        } else {
            this.menus = [
                { title: 'Update Banking Detail', url: '', disable: false },
                { title: 'Submit', url: '', disable: false },
                { title: 'View Invoices', url: '', disable: false }
            ];
        }
        if (this.tracerList[0].rolePlayerBankingDetails.rolePlayerBankingId !== 0 && this.tracerList[0].totalAmountPaid >= this.tracerList[0].funeralTracingMaxAmount) {
            this.menus = [
                { title: 'Update Banking Detail', url: '', disable: false },
                { title: 'Submit', url: '', disable: true },
                { title: 'View Invoices', url: '', disable: false },
            ];
        }
    }

    onMenuSelect(accountId: any, rolePlayerId: any, title: any) {
        switch (title) {
            case 'Submit':
                this.rolePlayerBankId = accountId;
                this.UpdateRolePlayerId = rolePlayerId;
                this.openDialog();
                // this.payThisAccount(accountId, rolePlayerId);
                break;
            case 'Update Banking Detail':
                this.rolePlayerBankId = accountId;
                this.UpdateRolePlayerId = rolePlayerId;
                this.addConfirmation(this.updateBankingDetailsType);
                break;
            case 'Add Banking Detail':
                this.AddBankingRolePlayerId = rolePlayerId;
                this.addConfirmation(this.createBankingDetailsType);
                break;
            case 'View Invoices':
                this.openInvoiceDialog(this.claimId);
                break;
        }
    }

    // Kick start the wizard for adding banking details
    createBankingDetailsWizard(rolePlayerId: any) {
        const request = new StartWizardRequest();
        request.type = 'create-banking-details';
        request.linkedItemId = rolePlayerId;
        this.wizardService.startWizard(request).subscribe(wizard => {
            this.router.navigateByUrl(`/claimcare/claim-manager/create-banking-details/continue/${wizard.id}`);
        });
    }

    // Kick start the wizard for updating banking details
    updateBankingDetailsWizard(bankAccountId: any, beneficiaryId: any): void {
        const request = new StartWizardRequest();
        request.type = 'update-banking-details';
        request.linkedItemId = bankAccountId;
        this.wizardService.startWizard(request).subscribe(wizard => {
            this.router.navigateByUrl(`/claimcare/claim-manager/update-banking-details/continue/${wizard.id}`);
        });
    }

    payThisAccount(bankAccountId: any, rolePlayerId: any): void {
        this.router.navigateByUrl('claimcare/claim-manager/funeral/claim-payment/' + this.claimId + '/' + rolePlayerId + '/' + bankAccountId);
    }

}
