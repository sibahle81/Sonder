import { Component, OnInit, ViewChild, Input, ElementRef, Inject, OnChanges, SimpleChanges } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HcpInvoiceQueriesDataSource } from './hcp-invoice-queries.datasource';
import { RolePlayerItemQueryStatusEnum, RolePlayerQueryItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-item-query-enums';
import { RolePlayerItemQueryResponse } from '../../entities/roleplayer-item-query-response';
import { MatTableDataSource } from '@angular/material/table';
import { RolePlayerQueryService } from '../../services/roleplayer-query-service';

@Component({
  selector: 'hcp-invoice-queries',
  templateUrl: './hcp-invoice-queries.component.html',
  styleUrls: ['./hcp-invoice-queries.component.css']
})
export class HcpInvoiceQueriesComponent implements OnInit, OnChanges {
    @Input() title = "Invoice Queries";
    form: any;
    showResponse: boolean = false;
    rolePlayerQueryItemType: RolePlayerQueryItemTypeEnum;
    itemId: number; 
    rolePlayerItemQueryResponses: RolePlayerItemQueryResponse[] = [];
    dataSourceQueryResponse = new MatTableDataSource<RolePlayerItemQueryResponse>(this.rolePlayerItemQueryResponses);
    
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    constructor(
        public dialogRef: MatDialogRef<HcpInvoiceQueriesComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public readonly dataSource: HcpInvoiceQueriesDataSource,
        private readonly rolePlayerQueryService: RolePlayerQueryService
    ) {
        this.rolePlayerQueryItemType = data.rolePlayerQueryItemType;
        this.itemId = data.itemId;
        this.dataSource = new HcpInvoiceQueriesDataSource(this.rolePlayerQueryService);
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.getData();
    }

    ngOnInit() {
        this.getData();
    }

    getData() {
      this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.itemId.toString());    
    }

    getDisplayColumns() {
        const columnDefinitions = [
        { def: 'queryReferenceNumber', show: true }
        , { def: 'queryDescription', show: true }
        , { def: 'rolePlayerItemQueryStatus', show: true }
        , { def: 'createdBy', show: true }
        , { def: 'createdDate', show: true }
        , { def: 'actions', show: true }
        ];
        return columnDefinitions
        .filter(cd => cd.show)
        .map(cd => cd.def);
    }

    getStatusName(statusId: number): string {
        return this.formatText(RolePlayerItemQueryStatusEnum[statusId]);
    }
    
    formatText(text: string): string {
        return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
    }

    onSelect(item: any): void {
      this.dataSourceQueryResponse = new MatTableDataSource<RolePlayerItemQueryResponse>(item.rolePlayerItemQueryResponses);        
      this.showResponse = true;      
    }
}
