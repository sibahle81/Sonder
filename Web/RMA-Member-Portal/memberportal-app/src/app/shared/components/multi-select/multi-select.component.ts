// wiki: http://bit.ly/2yzaWd9
// Common multi select control that gets data from service.
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Lookup } from '../../models/lookup.model';
import { AlertService } from '../../services/alert.service';
import { LookupService } from '../../services/lookup.service';


/** @description Common multi select control that gets data from service. */
@Component({
  templateUrl: './multi-select.component.html',
  // tslint:disable-next-line:component-selector
  selector: 'multi-select',
  styleUrls: ['./multi-select.component.scss'],
})
export class MultiSelectComponent implements OnInit {
  _selectedIds: number[];
  _items: Lookup[];
  isError: boolean;
  selectControl = new FormControl();
  selectedItems: Lookup[];

  @Input() label: string;
  @Input() lookupName: string;
  @Input() lookupConnectionName: string;
  @Input() lookupId: number;
  @Input() isReadOnly: boolean;
  @Input() lookupUrl: string;
  @Input() lookupConnectionUrl: string;
  @Input() isRequired: false;
  @Input() name: string;
  @Input() id: string;
  @Input() errorMessage: string;
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onChange = new EventEmitter<boolean>();
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSelect = new EventEmitter<number[]>();

  @Input()
  set selectedIds(selected: number[]) {
    this._selectedIds = selected;
    this.setSelectedIds(selected);
  }
  get selectedIds(): number[] { return this._selectedIds; }

  @Input()
  set items(selected: Lookup[]) {
    this._items = selected;
    this.setSelectedIds(this.selectedIds);
  }
  get items(): Lookup[] { return this._items; }

  constructor(
    private readonly lookupService: LookupService,
    private readonly alertService: AlertService) {
  }

  ngOnInit() {
    this.setValidation();
    if (this.lookupUrl) {
      this.lookupService.getLookupWithUrl(this.lookupUrl).subscribe(
        items => {
          this.setViewItemProperties(items);
        },
        error => this.error(error));
    } else if (this.lookupName) {
      this.lookupService.getLookup(this.lookupName).subscribe(
        items => {
          this.setViewItemProperties(items);
        },
        error => this.error(error));
    }
  }

  setValidation(): void {
    if (this.isRequired) {
      this.selectControl.setValidators([Validators.required]);
    } else {
      this.selectControl.clearValidators();
    }
  }

  get isValid(): boolean {
    this.selectControl.markAsTouched();
    this.selectControl.markAsDirty();
    this.selectControl.updateValueAndValidity();
    return this.selectControl.valid;
  }

  /**
   * @description Adds the lookup items to the control.
   * @param Lookup[] items The error message that was thrown from the service.
   */
  setViewItemProperties(items: Lookup[]): void {
    this.items = items.sort(this.sortByNameAsc);
    this.selectedItems = new Array<Lookup>();

    if (this.lookupId === undefined || this.lookupId === null || this.lookupId < 1) { return; }
    if (this.lookupConnectionUrl) {
      this.lookupService.getLookupConnectionUrl(this.lookupConnectionUrl, this.lookupId).subscribe(
        connectionItems => {
          this.processConnectionItems(connectionItems);
        },
        error => this.error(error));
    } else if (this.lookupConnectionName) {
      this.lookupService.getLookupConnectionTable(this.lookupConnectionName, this.lookupId).subscribe(
        connectionItems => {
          this.processConnectionItems(connectionItems);
        },
        error => this.error(error));
    }
  }

  private processConnectionItems(connectionItems: Lookup[]): void {
    for (const connectionItem of connectionItems) {
      for (const item of this.items) {
        if (item.id === connectionItem.id) {
          this.selectedItems.push(item);
        }
      }
    }
    this.selectControl.setValue(this.selectedItems);
  }

  /**
   * @description Sorts the data ascendingly.
   * @param Lookup a The first name in the comparision.
   * @param Lookup b The second name in the comparision.
   */
  sortByNameAsc(a: Lookup, b: Lookup): number {
    // const nameA = a.name.toLowerCase();
    // const nameB = b.name.toLowerCase();

    // if (nameA < nameB) {
    //     return -1;
    // }
    // if (nameA > nameB) {
    //     return 1;
    // }
    return 0;
  }

  /**
   * @description Sets the items as selected.
   * @param nunber[] selectedids The error message that was thrown from the service.
   */
  setSelectedIds(selectedids: number[]): void {
    if (selectedids && this.items) {
      this.selectedItems = new Array<Lookup>();
      for (const selectedId of selectedids) {
        for (const item of this.items) {
          if (item.id === selectedId) {
            this.selectedItems.push(item);
          }
        }
      }
      this.selectControl.setValue(this.selectedItems);
      this.selectControl.updateValueAndValidity();
    }
  }

  /** @description Gets all selected items and returns their ids. */
  getSelectedItems(): number[] {
    const ids: number[] = [];
    const selectedIds = this.selectControl.value ? this.selectControl.value.length : 0;
    for (let i = 0; i < selectedIds; i++) {
      ids.push(this.selectControl.value[i].id);
    }
    return ids;
  }


  /**
   * @description Cancels any operation and shows an error message.
   * @param any error The error message that was thrown from the service.
   */
  error(error: any): void {
    this.isError = true;
    this.alertService.handleError(error);
  }

  /** @description Notify any parent components that a change was made. */
  onChanged(): void {
    if (!this.isReadOnly) {
      this.onChange.emit(true);
      if (this.isRequired) {
        this.selectControl.updateValueAndValidity();
      }
      this.onSelect.emit(this.getSelectedItems());
    }
  }

  /** @description Clears the selected items. */
  clearSelectedItems(): void {
    this.selectedItems = new Array<Lookup>();
    this.selectControl.setValue(this.selectedItems);
  }

}
