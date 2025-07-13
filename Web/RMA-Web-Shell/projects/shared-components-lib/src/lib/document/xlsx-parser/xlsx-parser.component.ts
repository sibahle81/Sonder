import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as XLSX from 'xlsx';
import { DefaultConfirmationDialogComponent } from '../../dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'xlsx-parser',
  templateUrl: './xlsx-parser.component.html',
  styleUrls: ['./xlsx-parser.component.css']
})
export class XlsxParserComponent implements OnChanges {

  @Input() expectedColumnHeadings = []; // * required. used to validate that the format of the uploaded file matches expected file template
  @Input() title = 'Upload File'; // optional: if no input is supplied this default title text will be used
  @Input() columnHeaderRowNumber = 1; // optional: if no input is supplied this default value will be used to identify the column header row number
  @Input() invalidRowsForExport: any[][]; // optional: if your custom functionality identified any invalid rows pass them in so that they can be exported

  @Output() fileDataEmit: EventEmitter<any[][]> = new EventEmitter(); // subscribe to this output on your parent component to receive the file data
  @Output() processConfirmedEmit: EventEmitter<boolean> = new EventEmitter(); // subscribe to this output on your parent component to receive the process confirmed command

  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('reading file...please wait');

  header: any[][]; // stores the header row (i.e column names)
  data: any[][]; // stores the data rows (i.e data rows)

  invalidHeader: any[][]; // stores the header row (i.e column names) includes an extra column for failed validation reasons
  invalidData: any[][] = []; // stores the rows identified as invalid by the parent component and passed in as input(invalidRowsForExport) used for exporting

  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };

  files: FileList; // the file that is uploaded, although this is a collection we only support a single file upload

  constructor(
    private readonly datePipe: DatePipe,
    public dialog: MatDialog
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.invalidRowsForExport.previousValue && this.invalidRowsForExport.length > 0) {
      this.invalidRowsForExport.forEach(row => {
        this.invalidData.push(row);
      });

      if (this.invalidData.length == this.data.length) {
        this.openMessageDialog(`Invalid Template Uploaded`, `No valid rows were detected. Please check the file format matches the expected template for ${this.title} functionality`);
      }
    }
  }

  onFileChange(evt: any) {
    this.isLoading$.next(true);
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>(evt.target);
    this.files = target.files;

    if (this.files.length !== 1) {
      this.openMessageDialog('Multiple Files', 'Cannot process multiple files');
      return;
    }

    if (this.files[0].type != 'application/vnd.ms-excel' && this.files[0].type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      this.openMessageDialog('Invalid File Type', 'Only .xlsx or .xls files are supported');
      return;
    }

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {

      /* read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      /* grab first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /* identify the data rows and header rows */
      let data = <any[][]>(XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }));
      this.header = data[this.columnHeaderRowNumber - 1];
      this.invalidHeader = this.header;

      if (this.fileTemplateIsValid()) {
        this.invalidData = [];

        this.addReasonColumn();
        this.invalidData.push(this.invalidHeader);

        this.data = <any[][]>(XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }));
        this.data.splice(0, this.columnHeaderRowNumber);

        if (this.data && this.data.length > 0) {
          this.fileDataEmit.emit(this.data);
        } else {
          this.openMessageDialog('Empty file', 'The uploaded file does not contain any rows');
        }
      }

      this.isLoading$.next(false);
    };

    reader.readAsBinaryString(this.files[0]);
  }

  fileTemplateIsValid(): boolean {
    if (!this.expectedColumnHeadings || this.expectedColumnHeadings.length <= 0) {
      this.openMessageDialog('File Template Undefined', 'No expected file column headings were defined');
      return false;
    }

    if (!this.header || this.header.length <= 0) {
      this.openMessageDialog('File Template Incorrect', `No file header row found at row ${this.columnHeaderRowNumber}`);
      return false;
    }

    if (this.header.length != this.expectedColumnHeadings.length) {
      this.openMessageDialog('File Template Incorrect', `Number of columns does not match the expected number of columns for ${this.title}`);
      return false;
    }

    for (let index = 0; index < this.header.length; index++) {
      if (this.header[index] != this.expectedColumnHeadings[index]) {
        this.openMessageDialog('File Template Incorrect', `The uploaded file must contain the pre-defined column headings for ${this.title}`);
        return false;
      }
    }

    return true;
  }

  addReasonColumn() {
    const commentsColumn: any = 'Failed Validation Reasons';
    this.invalidHeader.push(commentsColumn);
  }

  process() {
    this.openConfirmationDialog();
  }

  openConfirmationDialog() {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: 'Process File?',
        text: 'Are you sure you want to proceed?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.processConfirmedEmit.emit(true);
      }
    });
  }

  generateTemplate() {
    if (this.expectedColumnHeadings.length > 0) {
      const template: any[][] = [];
      template.push(this.expectedColumnHeadings);
      this.export(template, 'bulk_upload_template');
    }
  }

  exportInvalid() {
    this.export(this.invalidData, 'invalid_data_export');
  }

  export(data: any[][], fileName: string): void {
    this.isLoading$.next(true);
    this.loadingMessage$.next('exporting...please wait');

    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    const now = this.datePipe.transform(new Date().getCorrectUCTDate(), 'yyyy-MM-dd');
    XLSX.writeFile(wb, `${fileName}_${now}.xlsx`);

    this.isLoading$.next(false);
  }

  reset() {
    this.files = null;
    this.header = null;
    this.data = null;
    this.invalidData = [];

    this.isLoading$.next(false);
  }

  openMessageDialog(title: string, message: string) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: title,
        text: message
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.reset();
    });
  }
}
