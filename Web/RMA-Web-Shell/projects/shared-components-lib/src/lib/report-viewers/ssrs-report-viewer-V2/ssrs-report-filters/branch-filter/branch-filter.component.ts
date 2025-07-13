import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { RegionEnum } from 'projects/shared-models-lib/src/lib/enums/branch-enum';

@Component({
  selector: 'branch-filter',
  templateUrl: './branch-filter.component.html',
  styleUrls: ['./branch-filter.component.css']
})
export class BranchFilterComponent implements OnInit, OnChanges {

  @Input() triggerReset: boolean;
  @Output() parameterEmit: EventEmitter<any[]> = new EventEmitter();

  form: UntypedFormGroup;

  branches: RegionEnum[];

  constructor(
    private readonly formBuilder: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    this.getLookups();
  }

  getLookups() {
    this.branches = this.ToArray(RegionEnum);
    this.createForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      branch: [{ value: 'all', disabled: false }]
    });
  }

  readForm() {
    const branch = this.form.controls.branch.value;

    if (branch) {
      const parameters = [{ key: 'BranchId', value: branch != 'all' ? +RegionEnum[branch] : branch }];
      this.parameterEmit.emit(parameters);
    }
  }

  reset() {
    if (this.form) {
      this.form.patchValue({
        branch: 'all'
      });
    }
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
