import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { BehaviorSubject } from 'rxjs';
import { CommissionBand } from '../../shared/commission-band';
import { CommissionBandService } from '../../shared/commission-band.service';
import { AddBandComponent } from './bands-dialogs/add-band/add-band.component';
import { EditBandComponent } from './bands-dialogs/edit-band/edit-band.component';

@Component({
  selector: 'app-manage-bands',
  templateUrl: './manage-bands.component.html',
  styleUrls: ['./manage-bands.component.css']
})
export class ManageBandsComponent implements OnInit {
  displayedColumns = ['commissionBandName', 'minSalaryBand', 'maxSalaryBand', 'commissionRate', 'actions'];
  public dataSource = new MatTableDataSource<CommissionBand>();
  index: number;
  id: number;
  isProcessing = false;
  processMessage: string;
  isError = false;
  errMessage = 'Commission band with same details exists';
  commissionBands: CommissionBand[];
  isLoadingCommissionBands$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  constructor(public commonService: CommonService,
              public dialog: MatDialog,
              private readonly confirmservice: ConfirmationDialogsService,
              private readonly router: Router,
              private readonly alertService: AlertService,
              public commissionBandService: CommissionBandService) {}

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;

  ngOnInit() {
    this.isError = false;
    this.getCommissionBands();
  }

  refresh() {
    this.getCommissionBands();
    if(this.dataSource.data.length > 1)
      this.paginator._changePageSize(this.paginator.pageSize);
  }

  addNew() {
    const dialogRef = this.dialog.open(AddBandComponent, {
      data: {commissionBand: null }
    });
    this.isError = false;
    
      dialogRef.afterClosed().subscribe(result => {
        if (result === 1) {
          var isValid = this.validateCommissionBands(this.commissionBandService.getDialogData());
          if(isValid == 0){
          this.isProcessing = true;
          this.processMessage = 'Adding commission band...';
          this.commissionBandService.addCommissionBand(this.commissionBandService.getDialogData()).subscribe(res=>{
            this.dataSource.data.push(this.commissionBandService.getDialogData());
            this.refresh();
            this.done('Commission band added successfully');
          });
        }else{
          this.isError = true;
        }
        }
      });
  }

  startEdit(commissionBand: CommissionBand): void {
    const dialogRef = this.dialog.open(EditBandComponent, {
      data: {commissionBandId: commissionBand.commissionBandId, commissionBandName: commissionBand.commissionBandName, minSalaryBand: commissionBand.minSalaryBand, maxSalaryBand: commissionBand.maxSalaryBand,
        commissionRate: commissionBand.commissionRate }
    });
    this.isError = false;
    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        this.isProcessing = true;
        this.processMessage = 'Updating commission band...';
        this.commissionBandService.editCommissionBand(this.commissionBandService.getDialogData()).subscribe(res=>{
        const foundIndex = this.dataSource.data.findIndex(x => x.commissionBandId === commissionBand.commissionBandId);
        this.dataSource.data[foundIndex] = this.commissionBandService.getDialogData();
        this.refresh();
        this.done('Commission band update successfully');
        });
      }
    });
  }

  deleteItem(commissionBand: CommissionBand): void {
    this.confirmservice.confirmWithoutContainer(' Delete', ' Are you sure you want to delete ' + commissionBand.commissionBandName + '?', 'Center', 'Center', 'Yes', 'No').subscribe(
        result => {
            if (result === true) {
                 this.isProcessing = true;
                 this.processMessage = 'Deleting commission band...';
                this.commissionBandService.deleteCommissionBand(commissionBand).subscribe(res => {
                  const foundIndex = this.dataSource.data.findIndex(x => x.commissionBandId === commissionBand.commissionBandId);
                  this.dataSource.data.splice(foundIndex, 1);
                  this.refresh();
                  this.done('Commission band deleted successfully');
                });
            }
        });
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

  getCommissionBands() {
    this.isLoadingCommissionBands$.next(true);
    this.commissionBandService.getCommissionBands().subscribe(commissionBands => {
      this.dataSource.data = commissionBands;
      this.commissionBands = commissionBands;
      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
      this.isLoadingCommissionBands$.next(false);
    });
  }

  validateCommissionBands(commissionBand: CommissionBand): number{
    var res = 0;
    if(commissionBand){
      if(this.commissionBands.find(x=>x.commissionBandName === commissionBand.commissionBandName)){
        res += 1;
      }
      if(this.commissionBands.find(x=>x.commissionBandName === commissionBand.commissionBandName && x.minSalaryBand === commissionBand.minSalaryBand)){
        res += 1;
      }
      if(this.commissionBands.find(x=>x.commissionBandName === commissionBand.commissionBandName && x.minSalaryBand === commissionBand.minSalaryBand
        && x.maxSalaryBand === commissionBand.maxSalaryBand)){
        res += 1;
      }
      if(this.commissionBands.find(x=>x.minSalaryBand === commissionBand.minSalaryBand && x.maxSalaryBand === commissionBand.maxSalaryBand)){
        res += 1;
      }
    }
    return res;
  }
}