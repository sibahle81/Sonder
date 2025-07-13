import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';

import { PrimeRateService } from '../../shared/prime-rate.service';
import { PrimeRate } from '../../shared/prime-rate';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AddPrimeRateComponent } from './prime-rates-dialogs/add-prime-rate/add-prime-rate.component';

@Component({
  selector: 'app-manage-prime-rates',
  templateUrl: './manage-prime-rates.component.html',
  styleUrls: ['../../../../../../../assets/css/site.css']
})
export class ManagePrimeRatesComponent implements OnInit {

  displayedColumns = ['startDate', 'endDate', 'value', 'createdDate', 'status'];
  public dataSource = new MatTableDataSource<PrimeRate>();
  index: number;
  id: number;
  isProcessing = false;
  processMessage: string;
  isError = false;
  errMessage = 'new prime rate start date should be recent';
  primeRates: PrimeRate[];
  isLoadingPrimeRates$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  latestPrimeRateId : number;


  constructor(public commonService: CommonService,
    public dialog: MatDialog,
    private readonly router: Router,
    private readonly alertService: AlertService,
    public primeRateService: PrimeRateService) {}

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;

  ngOnInit() {
  this.isError = false;
  this.getPrimeRates();
  }


	  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }

  refresh() {
  this.getPrimeRates();
  if(this.dataSource.data.length > 1)
  this.dataSource.paginator._changePageSize(this.dataSource.paginator.pageSize);
  }

  getPrimeRates(){
    this.isLoadingPrimeRates$.next(true);
    this.primeRateService.getHistory().subscribe({
      next: (data: PrimeRate[]) => {
        this.latestPrimeRateId = data[0]?.id;
        this.dataSource.data = data;
        this.primeRates = data;
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
      },
      complete: () => {
        this.isLoadingPrimeRates$.next(false);
      }
    });
  }

  addPrimeRate(primeRate: PrimeRate){
    this.isLoadingPrimeRates$.next(true);
    this.primeRateService.addPrimeRate(primeRate).subscribe({
      next: (result) => {

       var insertedPrimeRate = this.primeRateService.getDialogData();
       insertedPrimeRate.id = result;
       insertedPrimeRate.createdDate = new Date();
       insertedPrimeRate.createdDate.setHours(0,0,0,0);
       var previousLatestPrimeRateId = this.latestPrimeRateId;
       this.latestPrimeRateId = result;

       if(this.primeRates.length > 0)
       {
        this.dataSource.data.find(x=>x.id == previousLatestPrimeRateId ).endDate = insertedPrimeRate.startDate;
        this.dataSource.data.splice(0,0,insertedPrimeRate);
       }
       else
       {
        this.dataSource.data.push(insertedPrimeRate);
       }

       this.refresh();
        this.done('Prime rate added successfully');
      },
      complete: () => {
        this.isLoadingPrimeRates$.next(false);
      }
    });
  }

  addNew() {
    const dialogRef = this.dialog.open(AddPrimeRateComponent, {
      data: {primeRate: null }
    });
    this.isError = false;
    
      dialogRef.afterClosed().subscribe(result => {
        if (result === 1) {
          var isValid = this.validatePrimeRates( this.primeRateService.getDialogData());
          if(isValid == 0){
          this.isProcessing = true;
          this.processMessage = 'Adding prime rate...';

          var rate = this.primeRateService.getDialogData() as PrimeRate;
          this.addPrimeRate(rate);

        }else{
          this.isError = true;
        }
        }
      });
  }
  
  validatePrimeRates(primeRate: PrimeRate): number{
    var res = 0;
    if(primeRate){
      if(this.primeRates.find(x=>x.startDate > primeRate.startDate)){
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

  getPrimeRateStatus(period: PrimeRate): string {
    let currentDate =  new Date();
    
    if(currentDate > new Date(period.startDate) && currentDate < new Date(period.endDate))
    {
      return 'Current';
    }
    if(new Date(period.startDate) > currentDate && currentDate < new Date(period.endDate))
    {
      return 'Future';
    }
    if(currentDate > new Date( period.endDate))
    {
      return 'History';
    }
    return 'History'
  } 

   getPrimeRateClass(period: PrimeRate): string {
     let currentDate =  new Date();
     if(currentDate > new Date(period.startDate) && currentDate < new Date(period.endDate))
      {
        return 'green';
      }
      if(new Date(period.startDate) > currentDate && currentDate < new Date(period.endDate))
      {
        return 'blue';
      }
      if(currentDate > new Date( period.endDate))
      {
        return 'gray';
      }
      return 'gray'
  } 
}
