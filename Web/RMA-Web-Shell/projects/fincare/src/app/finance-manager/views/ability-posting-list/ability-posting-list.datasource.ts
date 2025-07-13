import { ProductCrossRefTranType } from '../../models/productCrossRefTranType.model';
import { ProductCrossRefTranTypeService } from '../../services/productCrossRefTranType.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { AbilityPostingService } from '../../services/ability-posting.service';
import { AbilityPosting } from '../../models/ability-posting.model';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { PaymentService } from '../../../payment-manager/services/payment.service';
import { Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
 
@Injectable()
export class AbilityPostingDatasource extends Datasource implements OnInit {
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isError = false;
  filteredData: AbilityPosting[] = [];
  renderedData: AbilityPosting[] = [];
  productCrossRefTranTypes: ProductCrossRefTranType[];
  isEnabled = false;
  canExport = false;

  constructor(
    appEventsManager: AppEventsManager,
    private readonly alertService: AlertService,
    private readonly productCrossRefTranTypeService: ProductCrossRefTranTypeService,
    private readonly datePipe: DatePipe,
    private readonly router: Router,
    private readonly paymentService: PaymentService,
    private readonly abilityPostingService: AbilityPostingService) {
    super(appEventsManager, alertService);

    this.defaultSortColumn = 'name';
  }

  ngOnInit() {
    this.getProductCrossRefTranTypes();
  }

  getData(): void {
    this.getAbilityPostings();
  }

  getAbilityPostings(): void {
    this.isLoading$.next(true);
    this.abilityPostingService.getPostedPayments().subscribe(abilityPostingAudits => {
      this.abilityPostingService.getAbilityPostings().subscribe(data => {
        this.productCrossRefTranTypeService.getProductCrossRefTranTypes().subscribe(refs => {
          this.productCrossRefTranTypes = new Array();
          this.productCrossRefTranTypes = refs;

          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < data.length; i++) {
            data[i].lineCount = abilityPostingAudits.filter(x => x.reference === data[i].reference).length;
            data[i].transactionType = abilityPostingAudits.filter(x => x.reference === data[i].reference)[0]?.benefitCode;
            if (this.productCrossRefTranTypes.find(x => x.chartISNo === data[i].chartISNo) !== undefined) {
              if (data[i].chartISNo === 30061) {
                if (data[i].reference.includes('CLMIND')) {
                  data[i].chartISName = 'FUNERAL INDIVIDUAL CLAIMS';
                } else if (data[i].reference.includes('CLMGRP')) {
                  data[i].chartISName = 'FUNERAL GROUP CLAIMS';
                } else if (data[i].reference.includes('CLMCOR')) {
                  data[i].chartISName = 'FUNERAL CORPORATE CLAIMS';
                }
              } else {
                data[i].chartISName = this.productCrossRefTranTypes.find(x => x.chartISNo === data[i].chartISNo &&
                  x.chartBSNo === data[i].chartBSNo &&x.isActive === true).chartIsName;
              }
            } else {
              data[i].chartISName = data[i].transactionType;
            }
            if (this.productCrossRefTranTypes.find(x => x.chartBSNo === data[i].chartBSNo) !== undefined) {
              data[i].chartBSName = this.productCrossRefTranTypes.find(x => x.chartBSNo === data[i].chartBSNo &&
                x.chartISNo === data[i].chartISNo &&
                x.isActive === true).chartBsName;
            } else {
              data[i].chartBSName = data[i].transactionType;
            }

            data[i].processed = data[i].isProcessed ? 'Yes' : 'No';
          }
        });
        if (data.find(x => x.isProcessed === false)) {
          this.isEnabled = true;
        }
        this.canExport = (data.length > 0);
        this.dataChange.next(data);
        this.isLoading$.next(false);
        this.paginator.length = data.length;
      }, error => { this.showError(error); this.isLoading$.next(false); });
    }, error => { this.showError(error); this.isLoading$.next(false); });
  }

  getProductCrossRefTranTypes() {
    this.canExport = false;
    this.productCrossRefTranTypes = new Array();
    this.productCrossRefTranTypeService.getProductCrossRefTranTypes().subscribe(refs => {
      this.productCrossRefTranTypes = refs;
    });
  }

  connect(): Observable<AbilityPosting[]> {
    const displayDataChanges = [
      this.dataChange,
      this.sort.sortChange,
      this.filterChange,
      this.paginator.page
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      this.filteredData = this.data.slice().filter((item: AbilityPosting) => {
        const searchStr = (item.reference).toLowerCase() + (item.chartISNo).toString().toLowerCase() + (item.chartBSNo).toString().toLowerCase();
        return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
      });

      const sortedData = this.getSortedData(this.filteredData.slice());

      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
      return this.renderedData;
    }));
  }

  disconnect() { }
}
