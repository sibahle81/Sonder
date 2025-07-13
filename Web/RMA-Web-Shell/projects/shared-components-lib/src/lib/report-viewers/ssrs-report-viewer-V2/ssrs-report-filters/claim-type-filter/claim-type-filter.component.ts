import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ClaimTypeEnum } from '../../../../../../../shared-models-lib/src/lib/enums/claim-type-enum';

@Component({
  selector: 'claim-type-filter',
  templateUrl: './claim-type-filter.component.html',
  styleUrls: ['./claim-type-filter.component.css']
})
export class ClaimTypeFilterComponent implements OnInit {

  @Input() triggerReset: boolean;
  @Output() parameterEmit: EventEmitter<any[]> = new EventEmitter();

  form: UntypedFormGroup;

  claimTypes = [    
    {key:'Funeral', value: ClaimTypeEnum.Funeral},
    {key:'COID', value: ClaimTypeEnum.IODCOID},
    {key:'NON-COID', value: ClaimTypeEnum.Other},
  ];

  constructor(
    private readonly formBuilder: UntypedFormBuilder
  ) { }

  ngOnInit(): void {    
    this.getLookups();
    this.reset();
  }

  getLookups() {    
    this.createForm();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      claimType: [{ value: 'all', disabled: false }]
    });
  }

  readForm() {
    const claimType = this.form.controls.claimType.value;

    if (claimType && claimType != 'all') {
      const parameters = [{ key: 'claimTypeId', value: claimType }];
      this.parameterEmit.emit(parameters);
    }
  }

  reset() {
    if (this.form) {
      this.form.patchValue({
        claimType: 'all'
      });
    }
  }
}