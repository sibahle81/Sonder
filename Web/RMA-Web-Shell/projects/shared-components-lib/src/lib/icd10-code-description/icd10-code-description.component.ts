import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ICD10Code } from 'projects/medicare/src/app/medi-manager/models/icd10-code';
import { ICD10CodeService } from 'projects/medicare/src/app/medi-manager/services/icd10-code-service';

@Component({
  selector: 'icd10-code-description',
  templateUrl: './icd10-code-description.component.html',
  styleUrls: ['./icd10-code-description.component.css']
})
export class Icd10CodeDescriptionComponent implements OnChanges {

  @Input() icd10CodeId: number;

  @Output() icd10CodeEmit: EventEmitter<ICD10Code> = new EventEmitter<ICD10Code>();
  
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  icd10Code: ICD10Code;

  message: string;

  constructor(
    private readonly icd10CodeService: ICD10CodeService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.icd10CodeId) {
      this.getIcd10Code();
    } else {
      this.message = 'N/A';
      this.isLoading$.next(false);
    }
  }

  getIcd10Code() {
    this.message = null;

    if (this.icd10CodeId) {
      this.icd10CodeService.getICD10CodeById(this.icd10CodeId).subscribe(result => {
        this.icd10Code = result;
        this.icd10CodeEmit.emit(this.icd10Code);
        this.isLoading$.next(false);
      }, error => {
        this.message = '-';
        this.isLoading$.next(false);
      });
    }
  }
}
