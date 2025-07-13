import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';

@Component({
  selector: 'module-type-filter',
  templateUrl: './module-type-filter.component.html',
  styleUrls: ['./module-type-filter.component.css']
})
export class ModuleTypeFilterComponent implements OnInit, OnChanges {

  @Input() triggerReset: boolean;
  @Input() title = 'Module Type';
  @Input() propertyName = 'ModuleTypeId';

  @Output() parameterEmit: EventEmitter<any[]> = new EventEmitter();

  form: UntypedFormGroup;

  moduleTypes: ModuleTypeEnum[];

  constructor(
    private readonly formBuilder: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    this.getLookups();
  }

  getLookups() {
    this.moduleTypes = this.ToArray(ModuleTypeEnum);
    this.createForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      moduleType: [{ value: 'all', disabled: false }]
    });
  }

  readForm() {
    const moduleType = this.form.controls.moduleType.value;

    if (moduleType) {
      const parameters = [{ key: this.propertyName, value: moduleType != 'all' ? +ModuleTypeEnum[moduleType] : moduleType }];
      this.parameterEmit.emit(parameters);
    }
  }

  reset() {
    if (this.form) {
      this.form.patchValue({
        moduleType: 'all'
      });

      this.readForm();
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
