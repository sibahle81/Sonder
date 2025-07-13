import { DatePipe, KeyValue } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DeclarationService } from 'projects/clientcare/src/app/member-manager/services/declaration.service';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-bundle-raise-details',
  templateUrl: './bundle-raise-details.component.html',
  styleUrls: ['./bundle-raise-details.component.css']
})
export class BundleRaiseDetailsComponent implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  form: UntypedFormGroup;

  industryClasses: IndustryClassEnum[];
  message: string;
  minDate: Date;

  reportUrl = 'RMA.Reports.ClientCare.Member/Collections/RMABundleRaiseReport';
  parameters: KeyValue<string, string>[] = [];

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    public dialog: MatDialog,
    private readonly datePipe: DatePipe
  ) {  }

  ngOnInit(): void {
    this.minDate = new Date().getCorrectUCTDate();
    this.getLookups();
  }

  getLookups() {
    this.industryClasses = this.ToArray(IndustryClassEnum);
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      industryClass: [{ value: null, disabled: false }, Validators.required],
      effectiveToDate: [{ value: null, disabled: false }, Validators.required]
    });

    this.isLoading$.next(false);
  }

  setParameter(key: string, value: string) {
    this.setParameters([{ key: key, value: key == 'IndustryClassId' ? (+IndustryClassEnum[value]).toString() : this.datePipe.transform(value, 'yyyy-MM-dd') }]);
    this.reset();
  }

  setParameters($event: KeyValue<string, string>[]) {
    if (!this.parameters) {
      this.parameters = [];
      this.parameters = $event;
    } else {

      $event.forEach(parameter => {
        const index = this.parameters.findIndex(s => s.key == parameter.key);
        if (index > -1) {
          this.parameters[index] = parameter;
        } else {
          this.parameters.push(parameter);
        }
      });

      const item = [...this.parameters];
      this.parameters = null;
      this.parameters = item;
    }
  }

  reset() {
    this.message = null;
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


