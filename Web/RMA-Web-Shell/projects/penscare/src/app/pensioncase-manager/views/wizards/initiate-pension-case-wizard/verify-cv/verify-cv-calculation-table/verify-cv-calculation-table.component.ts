import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Benefit, VerifyCVCalculationResponse } from 'projects/shared-components-lib/src/lib/models/pension-case.model';
import { BeneficiaryTypeEnum } from 'projects/shared-models-lib/src/lib/enums/beneficiary-type-enum';

@Component({
  selector: 'app-verify-cv-calculation-table',
  templateUrl: './verify-cv-calculation-table.component.html',
  styleUrls: ['./verify-cv-calculation-table.component.css']
})

export class VerifyCvCalculationTableComponent implements OnInit {

  @Input() compensationDataSource: Benefit[];
  @Input() response: VerifyCVCalculationResponse;
  beneficiaryTypeEnum = BeneficiaryTypeEnum;

  //displayedColumns = ['beneficiaryTypeDescription', 'beneficiaryNameAndSurname', 'dateOfBirth', 'ageString', 'av', 'cv']

  displayedColumns = [
    'beneficiaryNameAndSurname',
    'beneficiaryTypeDescription',
    'dateOfBirth',
    'age',

    'productCode',
    'benefit',

    'av',
    'cv'
  ];

  constructor() { }

  ngOnInit() {
    this.compensationDataSource = this.compensationDataSource.filter(benefit => {
      return benefit.cv !== 0;
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.compensationDataSource = this.compensationDataSource.filter(benefit => {
      return benefit.cv !== 0;
    })
  }
}
