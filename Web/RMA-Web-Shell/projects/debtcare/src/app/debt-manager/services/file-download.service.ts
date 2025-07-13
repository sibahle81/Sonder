import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'

@Injectable({
  providedIn: 'root'
})
export class FileDownloadService {

  constructor() { }

  docValue: any;
  widthTab: number;

  ngOnInit(): void{
    this.docValue = new jsPDF();
    this.widthTab = this.docValue.internal.pageSize.getWidth() * 0.98;
  }


  exportToPdf(document,widthTable = this.widthTab): void {
    const data = document.data;
    if(data?.length > 0){
      const columns = this.getColumns(data);
      const rows = this.getRows(data, columns);
      const tableWidth = widthTable;
      autoTable(this.docValue,{
        head: [columns],
        body: rows,
        tableWidth: tableWidth,
        margin: { left: 2 },
        styles: {
          fontSize: document.fontSize,
        }
      });
      this.docValue.save(document.documentName);
    }
  }

  getColumns(data): string[] {
    const columns = [];
    data.forEach(row => {
      Object.keys(row).forEach(col => {
        if (!columns.includes(col)) {
          columns.push(col);
        }
      });
    });
    return columns;
  }

  getRows(data, columns) {
    const rows = [];
    data.forEach(row => {
      const values = [];
      columns.forEach(col => {
        values.push(row[col] || '');
      });
      rows.push(values);
    });
    return rows;
  }

}
