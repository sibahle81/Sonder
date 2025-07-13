import { Component, Input, OnInit } from '@angular/core';
import { Benefit } from 'projects/shared-components-lib/src/lib/models/pension-case.model';
import { PensionProductOptionsEnum } from 'projects/shared-models-lib/src/lib/enums/pension-product-options-enum';
export class ComponentInputData {
  dataSource: Benefit[];
  displayHeaders: boolean;
}

@Component({
  selector: 'app-verify-compensation-table',
  templateUrl: './verify-compensation-table.component.html',
  styleUrls: ['./verify-compensation-table.component.css']
})
export class VerifyCompensationTableComponent implements OnInit {

  @Input() compensationDataSource: Benefit[];

  displayColumns = [
    'beneficiaryTypeDescription',
    'beneficiaryNameAndSurname',
    'dateOfBirth',
    'age',

    'productCode',
    'benefit',
    'cvPercentage',

    'compensation',
    'percentageIncrease',
    'increase',
  ];

  constructor() { }

  ngOnInit() {}

}
