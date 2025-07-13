import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TemplateTypeEnum } from 'projects/shared-models-lib/src/lib/enums/template-type-enum';
import { BehaviorSubject } from 'rxjs';
import { ProductOption } from '../../models/product-option';
import { ProductOptionTemplateType } from '../../models/product-option-template-type';
import { Template } from '../../models/template';
import { ProductOptionService } from '../../services/product-option.service';

@Component({
  selector: 'product-option-template-type',
  templateUrl: './product-option-template-type.component.html',
  styleUrls: ['./product-option-template-type.component.css']
})
export class ProductOptionTemplateTypeComponent implements OnChanges {

  @Input() productOption = new ProductOption();
  @Input() isWizard = false;
  @Input() isReadOnly = false;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  productOptionTemplateTypes: ProductOptionTemplateType[] = [];
  filteredTemplateTypes: any[] = [];
  templates: Template[];

  form: FormGroup;
  hideForm = true;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly productOptionService: ProductOptionService) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.getLookups();
  }

  getLookups() {
    this.resetLookups();
    this.productOptionService.getTemplates().subscribe(results => {
      this.templates = results;
      if (this.productOption && this.productOption.productOptionTemplateTypes) {
        this.filterTemplateTypes(this.productOption.productOptionTemplateTypes);
      }

      this.createForm();
      this.isLoading$.next(false);
    });
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      templateType: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      template: [{ value: null, disabled: this.isReadOnly }, Validators.required],
    });
  }

  showForm() {
    this.toggleForm();
  }

  add() {
    const productOptionTemplateType = new ProductOptionTemplateType();
    productOptionTemplateType.productOptionId = this.productOption.id;
    productOptionTemplateType.templateType = +TemplateTypeEnum[this.form.controls.templateType.value];
    productOptionTemplateType.templateId = this.form.controls.template.value;

    if (!this.productOption.productOptionTemplateTypes) {
      this.productOption.productOptionTemplateTypes = [];
    }

    this.productOption.productOptionTemplateTypes.push(productOptionTemplateType);
    this.reset(true);
  }

  delete(productOptionTemplateType: ProductOptionTemplateType) {
    this.hideForm = true;
    const index = this.productOption.productOptionTemplateTypes.findIndex(s => s === productOptionTemplateType);
    this.productOption.productOptionTemplateTypes.splice(index, 1);
    this.reset(false);
  }

  cancel() {
    this.reset(true);
  }

  reset(toggleForm: boolean) {
    if (toggleForm) {
      this.toggleForm();
    }

    this.form.controls.templateType.reset();
    this.form.controls.template.reset();
    this.filterTemplateTypes(this.productOption.productOptionTemplateTypes);
  }

  toggleForm() {
    this.hideForm = !this.hideForm;
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

  getTemplateName(templateId: number): string {
    return (this.templates.find(s => s.templateId === templateId)).name;
  }

  filterTemplateTypes(productOptionTemplateTypes: ProductOptionTemplateType[]) {
    this.resetLookups();

    if (productOptionTemplateTypes) {
      productOptionTemplateTypes.forEach(productOptionTemplateType => {
        const templateTypeString = this.getTemplateTypeString(productOptionTemplateType.templateType);
        const index = this.filteredTemplateTypes.findIndex(s => s.toString() === templateTypeString);
        if (index > -1) {
          this.filteredTemplateTypes.splice(index, 1);
        }
      });
    }
  }

  getTemplateTypeString(templateType: TemplateTypeEnum): string {
    return TemplateTypeEnum[templateType];
  }

  resetLookups() {
    this.filteredTemplateTypes = this.ToArray(TemplateTypeEnum);
    this.filteredTemplateTypes = this.filteredTemplateTypes.filter(type => type == 'PolicySchedule' || type == 'Quotation' || type == 'Email' || type == 'Sms');
  }
}
