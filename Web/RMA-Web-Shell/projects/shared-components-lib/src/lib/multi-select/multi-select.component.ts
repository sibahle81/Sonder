// wiki: http://bit.ly/2yzaWd9
// Common multi select control that gets data from service.
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { UntypedFormControl, Validators } from '@angular/forms';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { Product } from 'projects/clientcare/src/app/product-manager/models/product';
import { ProductOptionService } from 'projects/clientcare/src/app/product-manager/services/product-option.service';

/** @description Common multi select control that gets data from service. */
@Component({
  templateUrl: './multi-select.component.html',
  // tslint:disable-next-line:component-selector
  selector: 'multi-select',
  styleUrls: ['./multi-select.component.css'],
})
export class MultiSelectComponent implements OnInit {
  _selectedIds: number[];
  _anySelectedIds: number[];
  _items: Lookup[];
  _anyItems: any[];
  isError: boolean;
  selectControl = new UntypedFormControl();
  selectedItems: Lookup[];
  selectedAnyItems: any[];
  products: Product[];

  @Input() label: string;
  @Input() lookupName: string;
  @Input() ItemList: string;
  @Input() lookupConnectionName: string;
  @Input() lookupId: number;
  @Input() anyId: number;
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

  @Input()
  set AnySelectedIds(selected: number[]) {
    this._anySelectedIds = selected;
    this.setAnySelectedIds(selected);
  }
  get AnySelectedIds(): number[] { return this._anySelectedIds; }

  @Input()
  set anyItems(selected: any[]) {
    this._anyItems = selected;
    this.setAnySelectedIds(this.AnySelectedIds);
  }
  get anyItems(): any[] { return this._anyItems; }

  constructor(
    private readonly lookupService: LookupService,
    private readonly alertService: AlertService,
    private readonly productService: ProductService,
    private readonly productOptionService: ProductOptionService) {
  }

  ngOnInit() {
  
    this.setValidation();
    if (this.lookupUrl) {
      this.lookupService.getLookupWithUrl(this.lookupUrl).subscribe(
        items => {
          this.setViewLookUpTableItemProperties(items);
        },
        error => this.error(error));
    } else if (this.lookupName) {
      this.lookupService.getLookup(this.lookupName).subscribe(
        items => {
          this.setViewLookUpTableItemProperties(items);
        },
        error => this.error(error));
    } else if (this.ItemList){
      if (this.ItemList === 'ProductList'){
       this.productService.getProducts().subscribe(
        items => { 
          this.setAnyViewItemProperties(items);
        }, error => this.error(error));
      } else if (this.ItemList === 'ProductOptionList'){
        this.productOptionService.getProductOptions().subscribe(
          items => { this.setAnyViewItemProperties(items);
          }, error => this.error(error));
      }
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
  setViewLookUpTableItemProperties(items: Lookup[]): void {
    this.items = items.sort(this.sortByNameAsc);
    this.selectedItems = new Array<Lookup>();

    if (this.lookupId === undefined || this.lookupId === null || this.lookupId < 1) { return; }
    if (this.lookupConnectionUrl) {
      this.lookupService.getLookupConnectionUrl(this.lookupConnectionUrl, this.lookupId).subscribe(
        connectionItems => {
          this.processConnectionLookUpTableItems(connectionItems);
        },
        error => this.error(error));
    } else if (this.lookupConnectionName) {
      this.lookupService.getLookupConnectionTable(this.lookupConnectionName, this.lookupId).subscribe(
        connectionItems => {
          this.processConnectionLookUpTableItems(connectionItems);
        },
        error => this.error(error));
    }
  }

  private processConnectionLookUpTableItems(connectionItems: Lookup[]): void {
    for (const connectionItem of connectionItems) {
      for (const item of this.items) {
        if (item.id === connectionItem.id) {
          this.selectedItems.push(item);
        }
      }
    }
    this.selectControl.setValue(this.selectedItems);
  }

  setAnyViewItemProperties(items: any[]){
    this.anyItems = items.sort(this.sortByNameAsc);
    this.selectedAnyItems = new Array<any>();
    if (this.lookupId === undefined || this.lookupId === null || this.lookupId < 1) { return; }
    this.productService.getProducts().subscribe(
      connectionItems => {
        this.processConnectionAnyTableItems(connectionItems);
      }, error => this.error(error));
  }

  private processConnectionAnyTableItems(connectionItems: any[]): void {
    for (const connectionItem of connectionItems) {
      for (const item of this.anyItems) {
        if (item.id === connectionItem.id) {
          this.selectedAnyItems.push(item);
        }
      }
    }
    this.selectControl.setValue(this.selectedAnyItems);
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

    /**
   * @description Sets the items as selected.
   * @param nunber[] selectedids The error message that was thrown from the service.
   */
  setAnySelectedIds(selectedids: number[]): void {
    if (selectedids && this.anyItems) {
      this.selectedAnyItems = new Array<any>();
      for (const selectedId of selectedids) {
        for (const item of this.anyItems) {
          if (item.id === selectedId) {
            this.selectedAnyItems.push(item);
          }
        }
      }
      this.selectControl.setValue(this.selectedAnyItems);
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

    /** @description Clears the selected items. */
    clearAnySelectedItems(): void {
      this.selectedItems = new Array<any>();
      this.selectControl.setValue(this.selectedAnyItems);
    }

}
