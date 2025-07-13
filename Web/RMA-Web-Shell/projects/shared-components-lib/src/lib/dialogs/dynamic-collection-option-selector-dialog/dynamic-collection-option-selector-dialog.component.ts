import { KeyValue } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './dynamic-collection-option-selector-dialog.component.html'
})
export class DynamicCollectionOptionSelectorDialogComponent {

  title = 'Options'; // default title but can be overridden
  text = 'Please select an option?'; // default text but can be overridden
  options: KeyValue<string, string>[] = []; // your array of options must be a key value object value displays in the dropdown, value to identify the option
  
  selected: KeyValue<string, string>;
  
  constructor(
    public dialogRef: MatDialogRef<DynamicCollectionOptionSelectorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.title = data.title ? data.title : this.title;
    this.text = data.text ? data.text : this.text;
    this.options = data.options ? data.options : this.options;
  }

  optionSelected($event: KeyValue<string, string>) {
    this.selected = $event;
  }

  confirm() {
    this.dialogRef.close(this.selected);
  }

  cancel() {
    this.dialogRef.close();
  }
}
