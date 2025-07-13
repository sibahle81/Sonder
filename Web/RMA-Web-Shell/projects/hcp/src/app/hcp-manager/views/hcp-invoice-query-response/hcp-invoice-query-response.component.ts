import { Component, OnInit, ViewChild, Input, ElementRef, Inject, OnChanges, SimpleChanges } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { RolePlayerQueryItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-item-query-enums';
import { RolePlayerItemQueryResponse } from '../../entities/roleplayer-item-query-response';
import { RolePlayerItemQuery } from '../../entities/roleplayer-item-query';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'hcp-invoice-query-response',
  templateUrl: './hcp-invoice-query-response.component.html',
  styleUrls: ['./hcp-invoice-query-response.component.css']
})

export class HcpInvoiceQueryResponseComponent implements OnChanges {
    @Input() title = "Query Response History";    
    @Input() dataSource = new MatTableDataSource<RolePlayerItemQueryResponse>;
    
    constructor(
    ) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes?.dataSource?.currentValue?.data && changes?.dataSource?.currentValue?.data.length > 0)
            this.dataSource.data = changes?.dataSource?.currentValue?.data;
    }

    getDisplayColumns() {
        const columnDefinitions = [
        { def: 'queryResponse', show: true }
        , { def: 'createdBy', show: true }
        , { def: 'createdDate', show: true }
        ];
        return columnDefinitions
        .filter(cd => cd.show)
        .map(cd => cd.def);
    }
}
