import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ControlNameEnum } from 'projects/fincare/src/app/shared/enum/control-name.enum';

@Component({
  selector: 'control-name-filter',
  templateUrl: './control-name-filter.component.html',
  styleUrls: ['./control-name-filter.component.css']
})
export class ControlNameFilterComponent implements OnInit, OnChanges {

  @Input() triggerReset: boolean;
  @Output() parameterEmit: EventEmitter<any[]> = new EventEmitter();

  form: UntypedFormGroup;

  controlNames: ControlNameEnum[];

  constructor(
    private readonly formBuilder: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    this.getLookups();
  }

  getLookups() {
    this.controlNames = this.ToArray(ControlNameEnum);
    this.createForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      controlName: [{ value: 'all', disabled: false }]
    });
  }

  readForm() {
    const controlName = this.form.controls.controlName.value;

    if (controlName) {
      const parameters = [{ key: 'ControlNameId', value: controlName != 'all' ? +ControlNameEnum[controlName] : controlName }];
      this.parameterEmit.emit(parameters);
    }
  }

  reset() {
    if (this.form) {
      this.form.patchValue({
        controlName: 'all'
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
