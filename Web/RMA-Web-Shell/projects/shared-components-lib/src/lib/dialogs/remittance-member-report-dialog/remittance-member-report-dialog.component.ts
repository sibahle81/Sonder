import { KeyValue } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { Payment } from 'projects/fincare/src/app/shared/models/payment.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { PaymentService } from 'projects/fincare/src/app/payment-manager/services/payment.service';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { takeUntil } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PBPayment } from 'projects/fincare/src/app/shared/models/PBPayment.model';
import { DatePipe } from '@angular/common';
import { Constants } from 'projects/fincare/src/app/payment-manager/models/constants';
import { StringOptionsWithImporter } from 'sass';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';


@Component({
  selector: 'lib-remittance-member-report-dialog',
  templateUrl: './remittance-member-report-dialog.component.html', 
  styleUrls: ['./remittance-member-report-dialog.component.css']
})
export class RemittanceMemberReportDialogComponent extends UnSubscribe  {
  displayedColumns: string[] = [
    'policyNumber',
    'reference',
    'amount',
    'action',
  ];
  PBPayments: PBPayment[] = [];
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  title = 'Remittance Reports'; // default title but can be overridden
  hideAdvancedFilter = false; // not hidden by defailt but can be 
  policy: Policy;
  payment: Payment;
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  standardFiltersExpanded: boolean;
  advancedFiltersExpanded: boolean;  
  triggerReset: boolean;
  startDate : string;
  endDate : string;
  reportUrl: string;
  parameters: KeyValue<string, string>[];
  reportParameters: KeyValue<string, string>[];
  selectedPolicy: Policy;
  public paymentsDataSource = new MatTableDataSource<PBPayment>();

  constructor(
    public paymentService: PaymentService,
    public dialogRef: MatDialogRef<RemittanceMemberReportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public datePipe: DatePipe) {
    super();
    this.title = data.title ? data.title : this.title;
    this.policy = data.policy ? data.policy : null;
    this.payment = data.payment ? data.payment : null;
    this.hideAdvancedFilter = true;    
  }  

  reset() {
    this.standardFiltersExpanded = false;
    this.advancedFiltersExpanded = false;

    if (this.policy) {
      this.selectedPolicy = null;
      this.parameters = null;
      this.reportParameters = null;
      this.setPolicy(this.policy)
    } else {
      this.selectedPolicy = null;
      this.parameters = null;
      this.reportParameters = null;
    }

    this.triggerReset = !this.triggerReset;
  }

  setPolicy($event: Policy) {
    this.advancedFiltersExpanded = false;
    this.selectedPolicy = $event;
    const parameter = [{ key: 'PolicyId', value: $event.policyId.toString() }]
    this.setParameters(parameter);
  }

  setParameters($event: KeyValue<string, string>[]) {
    if (!this.parameters) {
      this.parameters = [];
      this.parameters = $event;
    } else {

      $event.forEach(parameter => {
        const index = this.parameters.findIndex(s => s.key == parameter.key);
        if (index > -1) {
          this.parameters[index] = parameter;
        } else {
          this.parameters.push(parameter);
        }
      });

      const item = [...this.parameters];
      this.parameters = null;
      this.parameters = item;
    }
    this.getPayments();

  }

  getPayments() {
    this.isLoading$.next(true);
    this.startDate = this.datePipe.transform(new Date(this.parameters.filter(x=>x.key.includes('StartDate'))[0].value), Constants.dateString);
    this.endDate = this.datePipe.transform(new Date(this.parameters.filter(x=>x.key.includes('EndDate'))[0].value), Constants.dateString);
    
    this.paymentService.getPolicyPaymentDetails(this.policy.policyId,this.startDate,this.endDate).pipe(takeUntil(this.unSubscribe$)).subscribe(policypayments => {
      if(policypayments){
        this.paymentsDataSource.data = policypayments.payments;
        setTimeout(() => {
          this.paymentsDataSource.paginator = this.paginator;
          this.paymentsDataSource.sort = this.sort;
        });
        this.isLoading$.next(false);
      } else {this.isLoading$.next(false);}
    });
  }

  cancel() {
    this.dialogRef.close();
  }
  
  onSelect(item: any): void {
    const repParameter = [{ key: 'PaymentId', value: item.paymentId.toString()}];          
    this.reportParameters = repParameter;
    if(item.rolePlayerIdentificationTypeId === RolePlayerIdentificationTypeEnum.Person)
    {
      this.reportUrl = 'RMA.Reports.FinCare/RMAFinCareRM34MemberRemittance';      
    }
    else
    {      
      this.reportUrl = 'RMA.Reports.FinCare/RMAFinanceRemittanceRM35ChequeNumberReportByPaymentId';
    }
  }

}
