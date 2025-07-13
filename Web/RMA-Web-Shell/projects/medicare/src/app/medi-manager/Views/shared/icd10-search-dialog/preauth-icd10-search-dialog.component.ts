import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup,  UntypedFormBuilder, Validators  } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ICD10CodeModel } from 'projects/shared-components-lib/src/lib/icd10-code-filter-dialog/icd10-code-model';
import { debounceTime, finalize, switchMap, tap } from 'rxjs/operators';
import { ICD10CodeService } from '../../../services/icd10-code-service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

@Component({
	selector: 'preauth-icd10-search-dialog',
	templateUrl: './preauth-icd10-search-dialog.component.html',
	styleUrls: ['./preauth-icd10-search-dialog.component.css']
})

export class PreauthIcd10SearchDialogComponent implements OnInit {

	isLoading = false;
	errorMsg: string;
	bodySides: any[];
	injuryTypes: any[];
	activeBodySideId: string;
	activeInjuryTypeId: string;
	activeICD10Record: ICD10CodeModel;
	addedICD10Records: ICD10CodeModel[];
	filteredRecords: any;
	filterRecordsCtrl = new UntypedFormControl();
	isICD10CodeExists = false;
	isFormValid: boolean = false;
	isBodySideSelected: boolean = false;
	isInjuryTypeSelected: boolean = false;
	public form : UntypedFormGroup;
	

	constructor(
		public dialogRef: MatDialogRef<PreauthIcd10SearchDialogComponent>,
		readonly alertService: AlertService,
		private readonly icd10CodeService: ICD10CodeService,
		@Inject(MAT_DIALOG_DATA) public data: { resultItems: ICD10CodeModel[], bodySides: any[], injuryTypes: any[] },
		private formBuilder: UntypedFormBuilder
	) { 
		this.form = this.formBuilder.group({
			searchtab: ['', Validators.required],
			bodysidetab: ['', Validators.required],
			injurytypetab: ['', Validators.required],
		});
	}

	ngOnInit() {
		this.elevateCssUtility('.custom-dialog > mat-dialog-container,mat-form-field,mat-select');//mat-form-field.mat-form-field-type-mat-select > .mat-form-field-wrapper');//.mat-form-field-appearance-legacy .mat-form-field-wrapper');
		this.initLookups();
		this.addedICD10Records = [];
		this.filteredRecords = [];
	}

	validateInputFields() {
		if (this.isBodySideSelected == true && this.isInjuryTypeSelected == true) {
			this.isFormValid = true;
		}
	}

	onValueChange(value: any): void {
		this.filteredRecords = [];
		this.isLoading = true;
		if(value !== void 0 && value !== null && value !== "" && value.length > 2)
		{
			this.icd10CodeService.filterICD10Code(encodeURIComponent(value)).subscribe(data => {

				if (data === void 0 || data.length == 0) return;

				// Make the results accessable
				this.filteredRecords = data;
				this.isLoading = false;
			});
		}
	}

	/* #region on-click */
	
	onClickOK(): void {
		this.addICD10CodeOnList();
	}

	onClickRemoveICD10Code(item: ICD10CodeModel): void {
		let index = this.findIndex(this.addedICD10Records, x => { return x.icd10CodeId == item.icd10CodeId });
		this.addedICD10Records.splice(index, 1);
	}

	onClickEnterKey(): void {
		document.getElementById("btn-OK").click();
	}

	onClickCancel(): void {
		this.dialogRef.close();
	}

	/* #endregion on-click */

	/* #region  on-changed */

	onBodySideChanged(evt: any): void {
		this.activeBodySideId = evt.value.id;
		this.isBodySideSelected = true;
		this.validateInputFields();
	}

	onInjuryTypeChanged(evt: any): void {
		let injuryType = this.findItem(this.injuryTypes, x => { return x.displayValue.localeCompare(evt.value) == 0 });
		this.activeInjuryTypeId = injuryType.id;
		this.isInjuryTypeSelected = true;
		this.validateInputFields();
	}

	onICD10CodeChanged(val: any): void {

		// Set the search text-box value to the text value of the selected drop-down
		//   item after stripping 'location_searching' from the text.
		let selected = val.substring("location_searching".length);

		// Add the selected list-item to the results collection
		for (const x of this.filteredRecords) if (x["displayValue"].toLowerCase() === selected.toLowerCase()) {
			//this.data.resultItems.push(x); 
			this.activeICD10Record = x;
		};

		// Update the drop-down with the selected list-item
		this.filterRecordsCtrl.setValue(selected);
	}

	/* #endregion on-changed */

	/* #region helper methods   */

	getBodySideDescription(bodySideId): string {
		if (!!bodySideId) {
			let bodySide = this.bodySides.find(bs => { return bodySideId == bs.id; });
			if (bodySide) return bodySide.displayValue;
		}
		return '';
	}

	getInjuryTypeDescription(injuryTypeId): string {
		if (!!injuryTypeId) {
			if(injuryTypeId === 1){
				return "Primary";
			}
			else{
				return "Secondary";
			}
		}
		return '';
	}

	addICD10CodeOnList(): void {
		if(this.activeICD10Record == undefined || this.activeBodySideId == undefined || this.activeInjuryTypeId == undefined)
		{
			this.alertService.error('Please select icd10 code, body side and injury type.');
			return;
		}
		this.activeICD10Record["bodySideId"] = this.activeBodySideId;
		this.activeICD10Record["injuryTypeId"] = this.activeInjuryTypeId;
		this.isICD10CodeExists = this.data.resultItems.some(x => x.icd10CodeId === this.activeICD10Record.icd10CodeId && x["bodySideId"] === this.activeBodySideId);
		if (this.isICD10CodeExists) {
			this.alertService.error('Same ICD10Code with same body side already added');
		}
		else {
			this.addedICD10Records.push(this.activeICD10Record);
			this.data.resultItems.push(this.activeICD10Record);
		}

		this.activeICD10Record = void 0;
		this.filterRecordsCtrl.setValue("");
	}

	initLookups(): void {
		this.bodySides = this.data.bodySides;
		this.injuryTypes = this.data.injuryTypes;
	}

	elevateCssUtility(selector: string): void {

		// Applies the generated attribute, specific to the component, to the provided
		//   css selector so any styling in the css file that applies to the given selector
		//   will in fact work.

		let elem = document.querySelector('preauth-icd10-search-dialog');

		let i = 0; for (; i < elem.firstElementChild.attributes.length; i++)
			if (elem.firstElementChild.attributes[i].name.startsWith('_ngcontent') === true) break;

		if (i >= elem.firstElementChild.attributes.length) throw `Failed to apply the 'app-announcement' component's unique attribute to '${selector}'. The unique attribute could not be identified.`;

		let attr = elem.firstElementChild.attributes[i].name;

		let tags = selector.split(",");
		for (let tag of tags) if (tag.trim().length > 0) document.querySelector(tag.trim()).setAttribute(attr, " ");

	}

	findItem<T>(itemList: T[], isMatchCallback: (item: T) => boolean) {
		return itemList.find(x => { return isMatchCallback(x); });
	}

	findIndex<T>(itemList: T[], isMatchCallback: (item: T) => boolean) {
		return itemList.findIndex(x => { return isMatchCallback(x); });
	}

	/* #endregion helper methods */
}
