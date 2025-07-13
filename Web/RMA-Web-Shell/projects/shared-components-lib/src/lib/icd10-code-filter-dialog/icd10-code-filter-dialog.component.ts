import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { ICD10CodeService } from './icd10-code-service';
import { ICD10CodeModel } from './icd10-code-model';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';

@Component({
  selector: 'icd10-code-filter-dialog',
  templateUrl: './icd10-code-filter-dialog.component.html',
  styleUrls: ['./icd10-code-filter-dialog.component.css']
})

export class ICD10CodeFilterDialogComponent implements OnInit {
  filterRecordsCtrl = new UntypedFormControl();
  bodySideDetailsCtl = new UntypedFormControl();
  filteredRecords: any;
  isLoading = false;
  errorMsg: string;
  bodySides$: Observable<Array<Lookup>>;
  severityList$: Observable<Array<Lookup>>;
  showOk = true;
  commentRequired = false;

  constructor(
    public dialogRef: MatDialogRef<ICD10CodeFilterDialogComponent>,
    private readonly icd10CodeService: ICD10CodeService,
    private readonly lookupService: LookupService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {

    this.bodySides$ = this.lookupService.getBodySides();
    this.severityList$ = this.lookupService.getInjurySeverities();
    this.showOk = false;// do not enable by default

    this.elevateCssUtility('.custom-dialog > mat-dialog-container');
    this.filteredRecords = [];
    this.filterRecordsCtrl.valueChanges
      .pipe(
        debounceTime(500),
        tap(() => {

          this.filteredRecords = [];
          this.isLoading = true;
        }),
        // If the entered search text is not empty then call filter api, otherwise provide an empty result set
        switchMap(value => value === void 0 || value === null || value === "" || value.length < 3 ? [] : this.icd10CodeService.filterICD10Code(encodeURIComponent(value))
          .pipe(
            finalize(() => {
              this.isLoading = false;
            })
          )
        )
      )
      .subscribe(data => {

        if (data === void 0 || data.length == 0) return;

        // Make the results accessable
        this.filteredRecords = data;
      });
  }

  onSelectChanged(val: any): void {

    // Set the search text-box value to the text value of the selected drop-down
    //   item after stripping 'location_searching' from the text.
    let selected = val.substring("location_searching".length);

    // Add the selected list-item to the results collection
    for (let x of this.filteredRecords)
      if (x.displayValue.toLowerCase() === selected.toLowerCase()) {
        this.data.resultItems.push(x);
        break;
      }


    // Update the drop-down with the selected list-item
    this.filterRecordsCtrl.setValue(selected);
  }

  validateICD10SupplementaryInformation(): void {
    const icd10CodeItem = this.data.resultItems[0];

    this.showOk = (icd10CodeItem.severity && icd10CodeItem.severity.length > 0) &&
      (icd10CodeItem.bodySideAffected && icd10CodeItem.bodySideAffected.length > 0 &&
        ((this.commentRequired && icd10CodeItem.bodySideComment && icd10CodeItem.bodySideComment.length > 0) || !this.commentRequired));
  }
  onEnterKey(): void {
    document.getElementById("btn-OK").click();
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  elevateCssUtility(selector: string): void {

    // Applies the generated attribute, specific to the component, to the provided
    //   css selector so any styling in the css file that applies to the given selector
    //   will in fact work.

    let elem = document.querySelector('icd10-code-filter-dialog');

    let i = 0; for (; i < elem.firstElementChild.attributes.length; i++)
      if (elem.firstElementChild.attributes[i].name.startsWith('_ngcontent') === true) break;

    if (i >= elem.firstElementChild.attributes.length) throw `Failed to apply the 'icd10-code-filter-dialog' component's unique attribute to '${selector}'. The unique attribute could not be identified.`;

    let attr = elem.firstElementChild.attributes[i].name;

    document.querySelector(selector).setAttribute(attr, ' ');
  }

  onBodySideChanged(evt: any): void {
    this.data.resultItems[0].bodySideAffected = evt.value;
    this.commentRequired = this.data.resultItems[0].bodySideAffected == "Other";
    this.validateICD10SupplementaryInformation();
  }

  onInjurySeverityChanged(evt: any): void {
    this.data.resultItems[0].severity = evt.value;
    this.validateICD10SupplementaryInformation();
  }

  onCommentChanged(evt: any): void {
    this.data.resultItems[0].bodySideComment = this.bodySideDetailsCtl.value;
    this.validateICD10SupplementaryInformation();
  }

}
