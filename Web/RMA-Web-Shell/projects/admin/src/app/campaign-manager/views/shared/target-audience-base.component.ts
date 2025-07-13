import { NgModel, UntypedFormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { LookupItem } from 'projects/shared-models-lib/src/lib/lookup/lookup-item';
import { TargetAudienceService } from '../../shared/services/target-audience.service';
import { Campaign } from '../../shared/entities/campaign';
import { map } from 'rxjs/operators';

export abstract class TargetAudienceBaseComponent {

  campaign: Campaign;
  isLoading = false;
  disableCategory = false;

  targetCategoryLabel = '...';
  targetCategoryId = 0;
  targetCategories: any[];

  itemType: string;
  categoryList: any[] = [];
  selectedCategories: number[] = [];

  entityId: number;
  entityList: LookupItem[] = [];
  filteredList: Observable<LookupItem[]>;
  listControl = new UntypedFormControl();

  get formValid(): boolean {
    if (this.targetCategoryId === 2) {
      return this.listControl.value !== '' && this.entityId > 0;
    } else {
      return this.targetCategoryId > 0;
    }
  }

  protected constructor(
    protected readonly baseItemType: string,
    protected readonly audienceService: TargetAudienceService
  ) { }

  abstract loadEntityList(): void;

  enableEdit(enable: boolean): void {
    if (enable) {
      this.listControl.enable();
    } else {
      this.listControl.disable();
    }
  }

  setSelectedEntity(item: LookupItem): void {
    this.entityId = item.id;
    this.listControl.disable();
    this.listControl.setValue(item.name);
  }

  setTargetCategoryId(id: number): void {
    this.entityId = 0;
    this.listControl.setValue('');
    this.targetCategoryId = id;
    this.disableCategory = id > 0;
    if (id > 0) {
      const category = this.targetCategories.find(c => c.id === id);
      if (category) {
        this.targetCategoryLabel = category.name;
      }
    } else {
      this.targetCategoryLabel = '...';
    }
    this.loadTargetAudienceCategories();
    this.enableEdit(true);
  }

  setSelectedCategories(ids: number[]): void {
    this.selectedCategories = ids;
  }

  getLookupItem(id: number, name: string): LookupItem {
    const item = new LookupItem();
    item.id = id;
    item.name = name;
    item.parentId = 1;
    return item;
  }

  selectItem(item: any): void {
    item.stopPropagation();
    item.preventDefault();
  }

  selectAll(select: NgModel): void {
    this.selectedCategories = this.categoryList.map(v => v.id);
  }

  deselectAll(select: NgModel): void {
    this.selectedCategories = [];
  }

  getSelectedCaption(): string {
    switch (this.selectedCategories.length) {
      case 0:
        return 'No items selected';
      case 1:
        return this.getFirstSeletedCategoryName();
      case 2:
        return `${this.getFirstSeletedCategoryName()} +1 other`;
      default:
        return `${this.getFirstSeletedCategoryName()} +${this.selectedCategories.length - 1} others`;
    }
  }

  getFirstSeletedCategoryName(): string {
    const item = this.categoryList.find(v => v.id === this.selectedCategories[0]);
    if (!item) { return ''; }
    return item.name;
  }

  setupTargetCategory(item: any): void {
    this.entityId = 0;
    this.selectedCategories = [];
    this.targetCategoryId = item.value;
    this.targetCategoryLabel = this.targetCategories.find(category => category.id === item.value).name;
    this.loadTargetAudienceCategories();
  }

  loadTargetAudienceCategories(): void {
    this.getSelectedItemType();
    this.getSelectedCampaignCategories(this.itemType);
    this.getTargetAudienceCategories(this.itemType);
  }

  getSelectedCampaignCategories(itemType: string): void {
    this.selectedCategories = [];
    if (itemType !== '') {
      if (this.campaign.targetAudiences) {
        const audiences = this.campaign.targetAudiences.filter(ta => ta.itemType === itemType);
        if (audiences) {
          this.selectedCategories = audiences.map(ta => ta.itemId);
        }
      }
    }
  }

  getTargetAudienceCategories(api: string): void {
    this.categoryList = [];
    if (api !== '') {
      this.isLoading = true;
      this.listControl.setValue('');
      api = this.parseApi(api);
      this.audienceService.getTargetCategoryItems(api).subscribe(
        data => {
          this.categoryList = data;
          this.isLoading = false;
        }
      );
    } else if (this.targetCategoryId === 2) {
      this.itemType = this.baseItemType;
      if (!this.entityList) {
        this.loadEntityList();
      }
      this.filteredList = this.listControl.valueChanges.pipe(map(value => this.entityList));
    } else if (this.targetCategoryId === 1) {
      this.itemType = this.baseItemType;
    }
  }

  private _filter(value: string): LookupItem[] {
    const filter = value.toLowerCase();
    return this.entityList.filter(item => item.name.toLowerCase().includes(filter));
  }

  clearSelectedId(): void {
    this.entityId = 0;
  }

  setSelectedId(id: number): void {
    this.entityId = id;
  }

  comparer(a: LookupItem, b: LookupItem): number {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if (nameA < nameB) { return -1; }
    if (nameA > nameB) { return 1; }
    return 0;
  }

  parseApi(api: string): string {
    if (api.startsWith('Lead') && api.length > 4) {
      api = api.substr(4);
    } else if (api.endsWith('Product')) {
      api = 'Product';
    }
    return api;
  }

  getSelectedItemType(): void {
    if (this.targetCategoryId > 2) {
      const category = this.targetCategories.find(cat => cat.id === this.targetCategoryId);
      this.itemType = category ? category.name : '';
    } else {
      this.itemType = '';
    }
  }

  setEntiyList(pId: number, pName: string) {
    this.entityList = [];
    this.entityList.push({ id: pId, name: pName } as LookupItem);
  }
}
