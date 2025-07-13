import { AfterViewChecked, Component, OnInit, ViewChild } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { UploadControlComponent } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

import { BenefitImportRequest } from '../../models/benefit-import-request';
import { BenefitImportService } from './benefit-import.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';

import 'src/app/shared/extensions/string.extensions';
import 'src/app/shared/extensions/date.extensions';
import * as XLSX from 'xlsx';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';

@Component({
  selector: 'app-benefit-import',
  templateUrl: './benefit-import.component.html',
  styleUrls: ['./benefit-import.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class BenefitImportComponent implements OnInit, AfterViewChecked {

  @ViewChild('uploadControl', { static: true }) uploadControlComponent: UploadControlComponent;

  private readonly relationTypes: string[] = ['M', 'S', 'C', 'P', 'X', 'E'];
  private readonly columnHeaders = [
    'RELATION TYPE',
    'DESCRIPTION',
    'MIN AGE',
    'MAX AGE',
    'COVER AMOUNT',
    'UW AMOUNT'
  ];
  private columnIndex = [-1, -1, -1, -1, -1, -1];

  form: FormGroup;
  disabled = false;
  isLoadingProducts = false;
  isLoadingCoverTypes = false;

  products: Product[] = [];
  coverTypes: Lookup[] = [];
  productOptionName = ''
  benefitName = '';
  benefitOptionName = '';
  optionValue = '';

  get disableForm(): boolean {
    if (this.disabled) { return true; }
    if (!this.form) { return true; }
    return this.form.invalid;
  }

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly alertService: AlertService,
    private readonly lookupService: LookupService,
    private readonly productService: ProductService,
    private readonly importService: BenefitImportService
  ) { }

  ngOnInit(): void {
    this.subscribeUploadChanged();
    this.loadProducts();
    this.loadCoverTypes();
  }

  ngAfterViewChecked(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      productId: [1, [Validators.required, Validators.min(1)]],
      effectiveDate: [new Date(), Validators.required],
      optionName: ['', [Validators.required, Validators.minLength(7)]],
      coverTypeId: [6, [Validators.required, Validators.min(1)]],
      benefitName: ['', [Validators.required, Validators.minLength(7)]],
      adminFee: [0, Validators.required],
      commission: [0, Validators.required],
      binderFee: [0, Validators.required],
      waitingPeriod: [6, Validators.required]
    });
  }

  loadProducts(): void {
    if (!this.products || this.products.length === 0) {
      this.isLoadingProducts = true;
      this.productService.getProducts().subscribe({
        next: (data: Product[]) => {
          this.products = data.sort((a, b) => a.name.localeCompare(b.name));
        },
        error: (response: HttpErrorResponse) => {
          const errorMessage = response.error.Error ? response.error.Error : response.message;
          this.alertService.error(errorMessage, 'Product Error');
          this.isLoadingProducts = false;
        },
        complete: () => {
          this.isLoadingProducts = false;
        }
      });
    }
  }

  loadCoverTypes(): void {
    if (!this.coverTypes || this.coverTypes.length === 0) {
      this.isLoadingCoverTypes = true;
      this.lookupService.getCoverTypes().subscribe({
        next: (data: Lookup[]) => {
          this.coverTypes = data;
        },
        error: (response: HttpErrorResponse) => {
          const errorMessage = response.error.Error ? response.error.Error : response.message;
          this.alertService.error(errorMessage, 'Cover Type Error');
          this.isLoadingCoverTypes = false;
        },
        complete: () => {
          this.isLoadingCoverTypes = false;
        }
      });
    }
  }

  save(): void {
    const files = this.uploadControlComponent.getUploadedFiles();
    if (files.length === 0) { return; }
    if (this.form.invalid) { return; }

    this.uploadControlComponent.isUploading = true;

    const values = this.form.getRawValue();
    this.productOptionName = values.optionName;
    this.benefitName = values.benefitName;

    for (const file of files) {
      file.isLoading = true;
      const benefitList: any[] = [];
      const reader = new FileReader();
      reader.onload = (event: Event) => {
        try {
          let data = reader.result as string;
          const identifier = 'base64,';
          const index = data.indexOf(identifier);
          if (index >= 0) {
            data = data.substring(index + identifier.length);
            const binaryString: string = atob(data);
            const workbook: XLSX.WorkBook = XLSX.read(binaryString, { type: 'binary' });
            for (const worksheetName of workbook.SheetNames) {
              if (worksheetName.indexOf('->') < 0) {
                this.benefitOptionName = this.getBenefitOptionName(worksheetName.trim().toLowerCase());
                const worksheet: XLSX.WorkSheet = workbook.Sheets[worksheetName];
                const content = XLSX.utils.sheet_to_csv(worksheet);
                const sheetData = this.parseCsvData(worksheetName, content.split('\n'));
                if (sheetData.length > 0) {
                  benefitList.push(...sheetData);
                } else {
                  this.alertService.error(`Parse error in worksheet ${worksheetName}`);
                  break;
                }
              }
            }
            const content = this.getImportContent(benefitList);
            if (content.length > 0) {
              this.importService.importBenefits(this.getBenefitImportRequest(content)).subscribe({
                next: (count: number) => {
                  this.alertService.success(`${count} benefits imported`);
                },
                error: (response: HttpErrorResponse) => {
                  const errorMessage = response.error
                    ? response.error.Error ? response.error.Error : response.statusText
                    : response.statusText;
                  this.alertService.error(errorMessage, 'Benefit Import Error');
                  this.uploadControlComponent.isUploading = false;
                },
                complete: () => {
                  this.resetUpload();
                }
              });
            } else {
              this.alertService.success('Content copied to clipboard');
              this.resetUpload();
            }
          }
        } catch (error) {
          this.alertService.error(error, 'Benefit Import Error');
          this.uploadControlComponent.isUploading = false;
        }
      };
      reader.readAsDataURL(file.file);
    }
  }

  resetUpload() {
    this.uploadControlComponent.resetUpload();
    this.uploadControlComponent.isUploading = false;
    this.form.patchValue({
      productId: 1,
      effectiveDate: new Date(),
      optionName: '',
      benefitName: '',
      adminFee: 0,
      commission: 0,
      binderFee: 0,
      waitingPeriod: 6
    });
  }

  private getBenefitImportRequest(content: string): BenefitImportRequest {
    var values = this.form.getRawValue();
    const request = new BenefitImportRequest();
    const effectiveDate = new Date(values.effectiveDate);
    effectiveDate.setHours(0, 0, 0, 0);
    request.productId = values.productId;
    request.productOptionName = values.optionName;
    request.coverType = values.coverTypeId;
    request.effectiveDate = effectiveDate.getCorrectUCTDate();
    request.adminFee = values.adminFee / 100.0;
    request.commission = values.commission / 100.0;
    request.binderFee = values.binderFee / 100.0;
    request.waitingPeriod = values.waitingPeriod;
    request.content = content;
    return request;
  }

  private getImportContent(benefitList: any[]): any {
    const benefitSet = new Set(benefitList);
    const jsonData = JSON.stringify([...benefitSet]);
    if (FeatureflagUtility.isFeatureFlagEnabled('ImportBenefits')) {
      const content = btoa(unescape(jsonData));
      return content;
    } else {
      navigator.clipboard.writeText(jsonData);
      return '';
    }
  }

  private getBenefitOptionName(worksheetName: string): string {
    if (worksheetName.startsWith('extended family')) {
      return 'Extended Family';
    } else if (worksheetName.startsWith('member only')) {
      return 'Member Only';
    } else {
      if (worksheetName.indexOf('-') >= 0) {
        worksheetName = worksheetName.slice(worksheetName.indexOf('-') + 1);
      }
      if (worksheetName.indexOf('(') > 0) {
        worksheetName = worksheetName.slice(0, worksheetName.indexOf('('));
      }
      while (worksheetName.indexOf(' ') >= 0) {
        worksheetName = worksheetName.replace(' ', '');
      }
      return String.replaceAll(worksheetName, ' ', '').toUpperCase();
    }
  }

  private parseCsvData(worksheetName: string, lines: string[]): string[] {
    const result: string[] = [];
    if (this.findColumnIndices(lines)) {
      for (const line of lines) {
        const data = this.splitLine(line);
        if (this.isBenefitLine(data[this.columnIndex[0]])) {
          if (data[this.columnIndex[0]] === 'M' || this.benefitOptionName.startsWith('Extended')) {
            this.optionValue = this.getOptionValue(this.parseNumber(data[this.columnIndex[4]]));
          }
          result.push(this.parseDataLine(data));
        }
      }
      return result;
    } else {
      return [];
    }
  }

  private isBenefitLine(data: string): boolean {
    if (!data) { return false; }
    const relation = data.trim();
    return this.relationTypes.findIndex(s => s === relation) >= 0;
  }

  private findColumnIndices(lines: string[]): boolean {
    this.columnIndex = [-1, -1, -1, -1, -1, -1];
    for (const line of lines) {
      const data = line.split(',');
      if (data.findIndex(s => s === this.columnHeaders[0]) >= 0) {
        for (let i = 0; i < this.columnHeaders.length; i++) {
          this.columnIndex[i] = data.findIndex(s => s === this.columnHeaders[i]);
          if (this.columnIndex[i] < 0) { return false; }
        }
        return true;
      }
    }
    return false;
  }

  private getOptionValue(s: string): string {
    const value = Number(s) / 1000;
    return value.toString() + 'K';
  }

  private splitLine(line: string): string[] {
    const result: string[] = [];
    const data = line.split(',');
    for (let i = 0; i < data.length; i++) {
      if (data[i].startsWith('"')) {
        result.push(data[i] + data[i + 1]);
      } else if (!data[i].endsWith('"')) {
        result.push(data[i]);
      }
    }
    return result;
  }

  private parseDataLine(data: string[]): string {
    const values = this.form.getRawValue();
    const result: string[] = [];
    const memberType = data[this.columnIndex[0]].trim().replace('P', 'X').replace('E', 'X');
    const coverAmount = this.parseNumber(data[this.columnIndex[4]]);

    result.push(memberType);
    result.push(values.benefitName);
    result.push(this.benefitOptionName);
    result.push(this.getMemberName(
      this.parseString(data[this.columnIndex[1]]),
      this.parseNumber(data[this.columnIndex[2]]),
      this.parseNumber(data[this.columnIndex[3]])));
    result.push(this.optionValue);
    result.push(this.parseNumber(data[this.columnIndex[2]]));
    result.push(this.parseNumber(data[this.columnIndex[3]]));
    result.push(coverAmount);
    result.push(this.parseNumber(data[this.columnIndex[5]]));
    return result.join('|');
  }

  private getMemberName(memberName: string, minAge: string, maxAge: string): string {
    if (memberName.toUpperCase() === 'MAIN MEMBER') {
      return `MAIN MEMBER ${minAge}-${maxAge}`;
    } else if (memberName.toUpperCase() === 'SPOUSE') {
      return `SPOUSE ${minAge}-${maxAge}`;
    } else if (this.benefitOptionName === 'Extended Family') {
      if (minAge === '85') {
        return 'Family Member Over 85';
      } else {
        return `Family Member ${minAge}-${maxAge}`;
      }
    } else {
      return memberName;
    }
  }

  private parseString(value: string): string {
    value = value.trim();
    value = value.split(' -').join('-');
    value = value.split('- ').join('-');
    return value;
  }

  private parseNumber(value: string): string {
    value = value.trim();
    value = value.split('"').join('');
    value = value.split(',').join('');
    value = value.split('$').join('');
    return value;
  }

  subscribeUploadChanged(): void {
    this.disabled = true;
    this.uploadControlComponent.uploadChanged.subscribe(
      data => {
        this.disabled = false;
      }
    );
  }
}
