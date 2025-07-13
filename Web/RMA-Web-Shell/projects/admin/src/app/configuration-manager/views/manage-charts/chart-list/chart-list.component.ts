import { Component, OnInit, Output, ViewChild, EventEmitter, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ChartsListDatasource } from './charts-list.datasource';
import { DataGridUtil } from 'projects/shared-utilities-lib/src/lib/grid/datagrid.util';
import { Format } from 'projects/shared-utilities-lib/src/lib/pipes/format';
import { ProductCrossRefTranType } from '../../../shared/productCrossRefTranType.model';
import { ProductCrossRefTranTypeService } from '../../../shared/productCrossRefTranType.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';

@Component({
  selector: 'app-charts-list',
  templateUrl: './chart-list.component.html',
  styleUrls: ['./chart-list.component.css']
})
export class ChartListComponent implements OnInit {
  canExport = 0;
  displayedColumns = ['productCodeId', 'origin', 'companyNo', 'branchNo', 'transactionTypeName', 'Level1', 'Level2', 'Level3', 'ChartISNo', 'ChartISName', 'ChartBSNo',
  'BSChartName', 'benefitCode'];

  columns: any[] = [
    { display: 'PRODUCT CODE', variable: 'productCodeId', },
    { display: 'ORIGIN', variable: 'origin', },
    { display: 'COMPANY', variable: 'companyNo', },
    { display: 'BRANCH', variable: 'branchNo', },
    { display: 'TRANSACTION TYPE', variable: 'transactionType', }, { display: 'LEVEL1', variable: 'level1', },
    { display: 'LEVEL2', variable: 'level2', },
    { display: 'LEVEL3', variable: 'level3', }, { display: 'IS CHART NO', variable: 'chartISNo', },
    { display: 'BS CHART NO', variable: 'chartBSNo', },
];
  get isLoading(): boolean { return this.dataSource.isLoading; }
  get isError(): boolean { return this.dataSource.isError; }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;
@Output() chartEmit: EventEmitter<ProductCrossRefTranType> = new EventEmitter();
  constructor(public readonly dataSource: ChartsListDatasource,
              private readonly router: Router,
              private readonly productCrossRefTranTypeService: ProductCrossRefTranTypeService,
              private readonly confirmservice: ConfirmationDialogsService,
              private readonly alertService: AlertService) {

    }

  ngOnInit() {
    this.getProductCrossRefTranTypes();
  }

  getProductCrossRefTranTypes(): void {
    // this.dataSource.filter = '';
    this.dataSource.setControls(this.paginator, this.sort);
    this.dataSource.getData();
    this.dataSource.isLoading = false;

    if (this.dataSource.data != null) {
      this.canExport = 1;
    }
}

done(statusMesssage: string) {
  this.alertService.success(statusMesssage, 'Success', true);
  this.dataSource.isLoading = true;
  this.dataSource.getData();
}

applyFilter(filterValue: any) {
  this.dataSource.filter = filterValue.trim().toLowerCase();
}

onDelete(productCrossRefTranType: ProductCrossRefTranType): void {
  this.confirmservice.confirmWithoutContainer(' Delete', ' Are you sure you want to delete ' + productCrossRefTranType.productCodeId + ' Transaction Ref?', 'Center', 'Center', 'Yes', 'No').subscribe(
      result => {
          if (result === true) {
              this.productCrossRefTranTypeService.removeProductCrossRefTranType(productCrossRefTranType.id).subscribe(res => {
                this.done('Chart deleted successfully');
              });
          }
      });
  }

  onEdit(productCrossRefTranType: ProductCrossRefTranType): void {
    this.chartEmit.emit(productCrossRefTranType);
  }

  exporttoCSV(): void {
    const def: any[] = [];
    const exprtcsv: any[] = [];
    ( JSON.parse(JSON.stringify(this.dataSource.data)) as any[]).forEach(x => {
        const obj = new Object();
        const frmt = new Format();
        for (let i = 0; i < this.columns.length; i++) {
            const transfrmVal = frmt.transform(x[this.columns[i].variable], '');
            obj[this.columns[i].display] = transfrmVal;
        }
        exprtcsv.push(obj);
    }
    );

    DataGridUtil.downloadcsv(exprtcsv, def, 'List_Of' + 'Charts');
    this.alertService.success('Charts exported successfully');
}

clear() {
  this.router.navigate(['config-manager/']);
}

}
