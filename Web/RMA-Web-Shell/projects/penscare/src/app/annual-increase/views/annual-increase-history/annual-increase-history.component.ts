import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AnnualIncreaseHistoryDataSource } from './annual-increase-history-datasource';

@Component({
  selector: 'app-annual-increase-history',
  templateUrl: './annual-increase-history.component.html',
  styleUrls: ['./annual-increase-history.component.css'],
  providers: [AnnualIncreaseHistoryDataSource]
})
export class AnnualIncreaseHistoryComponent implements OnInit {

  constructor(public readonly dataSource: AnnualIncreaseHistoryDataSource) { }

  ngOnInit(): void {

  }

  //table definition
  metaData = {
      displayColumns: [
        "createdDate",
        "effectiveDate",
        "type",
        "status",
        "percentage",
        "amount",
        "modifiedBy",
      ],
      columnsDef: {
        createdDate: {
          displayName: "Year",
          type: "text",
          sortable: true,
        },
        effectiveDate: {
          displayName: "Effective Date",
          type: "date",
          sortable: false,
        },
        type: {
          displayName: "Type",
          type: "text",
          sortable: true,
        },
        status: {
          displayName: "Status",
          type: "text",
          sortable: true,
        },
        percentage: {
          displayName: "Percentage",
          type: "percent",
          sortable: false,
        },
        amount: {
          displayName: "Flat Amount",
          type: "currency",
          sortable: false,
        },
        modifiedBy: {
          displayName: "Completed By",
          type: "text",
          sortable: false,
        },
      },
  };

}
