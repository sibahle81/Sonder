import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';

import { ForecastRateService } from '../../shared/forecast-rate.service';
import { ForecastRate } from '../../shared/forecast-rate';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AddForecastRateComponent } from './forecast-rates-dialogs/add-forecast-rate/add-forecast-rate.component';

@Component({
  selector: 'app-manage-forecast-rates',
  templateUrl: './manage-forecast-rates.component.html',
  styleUrls: ['../../../../../../../assets/css/site.css']
})
export class ManageForecastRatesComponent implements OnInit {

  displayedColumns = ['EffectiveFrom','Name', 'EffectiveTo', 'ForecastRate','CreatedDate','status'];
  public dataSource = new MatTableDataSource<ForecastRate>();
  index: number;
  id: number;
  isProcessing = false;
  processMessage: string;
  isError = false;
  errMessage = 'new forecast rate start date should be recent';
  forecastRates: ForecastRate[];
  isLoadingForecastRates$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  latestForecastRateId : number;


  constructor(public commonService: CommonService,
    public dialog: MatDialog,
    private readonly router: Router,
    private readonly alertService: AlertService,
    public forecastRateService: ForecastRateService) {}

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;

  ngOnInit() {
  this.isError = false;
  this.getForecastRates();
  }


	  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }

  refresh() {
  this.getForecastRates();
  if(this.dataSource.data.length > 1)
  this.dataSource.paginator._changePageSize(this.dataSource.paginator.pageSize);
  }

  getForecastRates(){
    this.isLoadingForecastRates$.next(true);
    this.forecastRateService.getAllForecastRates().subscribe({
      next: (data: ForecastRate[]) => {
        this.latestForecastRateId = data[0]?.forecastRateId;
        this.dataSource.data = data;
        this.forecastRates = data;
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
      },
      complete: () => {
        this.isLoadingForecastRates$.next(false);
      }
    });
  }

  addForecastRate(forecastRate: ForecastRate){
    this.isLoadingForecastRates$.next(true);
    this.forecastRateService.addForecastRate(forecastRate).subscribe({
      next: (result) => {
      this.refresh();
      this.done('Forecast rate added successfully');
      },
      complete: () => {
        this.isLoadingForecastRates$.next(false);
      }
    });
  }

  addNew() {
    const dialogRef = this.dialog.open(AddForecastRateComponent, {
      data: {forecastRate: null }
    });
    this.isError = false;
    
      dialogRef.afterClosed().subscribe(result => {
        if (result === 1) {
          var isValid = this.validateForecastRates( this.forecastRateService.getDialogData());
          if(isValid == 0){
          this.isProcessing = true;
          this.processMessage = 'Adding forecast rate...';

          var rate = this.forecastRateService.getDialogData() as ForecastRate;
          this.addForecastRate(rate);

        }else{
          this.isError = true;
        }
        }
      });
  }
  
  validateForecastRates(forecastRate: ForecastRate): number{
    var res = 0;
    if(forecastRate){
      if(this.forecastRates.find(x=>x.effectiveFrom > forecastRate.effectiveFrom)){
        res += 1;
      }
    }
    return res;
  }

  done(statusMesssage: string) {
    this.alertService.success(statusMesssage, 'Success', true);
    this.isProcessing = false;
  }

  clear() {
    this.router.navigate(['config-manager/']);
  }

  searchData(data) {
    this.applyFilter(data);
  }

  applyFilter(filterValue: any) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.dataSource.paginator.firstPage();
  }

  getForecastRateStatus(period: ForecastRate): string {
    let currentDate =  new Date();
    
    if(currentDate > new Date(period.effectiveFrom) && currentDate < new Date(period.effectiveTo))
    {
      return 'Current';
    }
    if(new Date(period.effectiveFrom) > currentDate && currentDate < new Date(period.effectiveTo))
    {
      return 'Future';
    }
    if(currentDate > new Date( period.effectiveTo))
    {
      return 'History';
    }
    return 'History'
  } 

   getForecastRateClass(period: ForecastRate): string {
     let currentDate =  new Date();
     if(currentDate > new Date(period.effectiveFrom) && currentDate < new Date(period.effectiveTo))
      {
        return 'green';
      }
      if(new Date(period.effectiveFrom) > currentDate && currentDate < new Date(period.effectiveTo))
      {
        return 'blue';
      }
      if(currentDate > new Date( period.effectiveTo))
      {
        return 'gray';
      }
      return 'gray'
  } 
}
