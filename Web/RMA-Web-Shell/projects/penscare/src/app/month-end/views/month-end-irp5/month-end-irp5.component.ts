import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { PenscareMonthEndService } from '../../../pensioncase-manager/services/penscare-month-end.service';

@Component({
  selector: 'app-month-end-irp5',
  templateUrl: './month-end-irp5.component.html',
  styleUrls: ['./month-end-irp5.component.css']
})
export class MonthEndIrp5Component implements OnInit {

  testType = [{ value: 'Test', viewValue: 'Test' }, { value: 'Live', viewValue: 'Live' }];
  irp5DocForm: UntypedFormGroup;
  years: number[] = [];
  irp5Date: any;

  constructor(private penscareMonthEndService: PenscareMonthEndService,
    private builder: UntypedFormBuilder) {
    this.generateYears();
  }

  ngOnInit(): void {
    this.buildIRP5Form();
  }

  buildIRP5Form(): void {
    this.irp5DocForm = this.builder.group({
      year: new UntypedFormControl('', [Validators.required]),
      indicator: new UntypedFormControl('', [Validators.required])
    });
  }

  generateYears(): any {
    for (let year = new Date().getFullYear(); year >= (new Date().getFullYear() - 10); year--) {
      this.years.push(year);
    }
  }

  generateDocument() {
    this.penscareMonthEndService.getEmployeeTaxFileInformation(parseInt(this.irp5DocForm.value.year), this.irp5DocForm.value.indicator).subscribe(res => {
      if (res) {
        import("xlsx").then(xlsx => {
          const worksheet = xlsx.utils.json_to_sheet(res);
          const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
          const excelBuffer: any = xlsx.write(workbook, { bookType: 'csv', type: 'array' });
          this.saveAsExcelFile(excelBuffer, "ExportExcel");
        });
      }
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.csv';
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }
}
