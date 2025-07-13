// import { DataGridUtil } from 'projects/shared-utilities-lib/src/lib/grid/datagrid.util';
import * as XLSX from 'xlsx';

export class DataGridUtil {

    public static downloadcsv(data: any, defaults: any, exportFileName: string) {
        const csvData = this.convertToCSV(data);
        const res = defaults;
        const results = res + csvData;
        const blob = new Blob([results], { type: 'text/csv;charset=utf-8;' });

        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, this.createFileName(exportFileName));
        } else {
            const link = document.createElement('a');
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', this.createFileName(exportFileName));
                // link.style = 'visibility:hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }

    public static downloadExcel(dataSource: any, fileName: string): void {  
        if (!dataSource || !dataSource.data || dataSource.data.length == 0) {
            return;
        }

         dataSource.data.forEach(element => {
            delete element.id;
            delete element.isDeleted;
            delete element.isActive;
            delete element.createdBy;
            delete element.createdDate;
            delete element.modifiedBy;
            delete element.modifiedDate;
        });
    
        const workSheet = XLSX.utils.json_to_sheet(dataSource.data, {header:[]});
        const workBook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workBook, workSheet, 'SheetName');
        XLSX.writeFile(workBook, fileName);
      }

    private static convertToCSV(objarray: any) {
        const array = typeof objarray !== 'object' ? JSON.parse(objarray) : objarray;

        let str = '';
        let row = '';

        // tslint:disable-next-line:forin
        for (const index in objarray[0]) {
            // Now convert each value to string and comma-separated
            row += index + ',';
        }
        row = row.slice(0, -1);
        // append Label row with line break
        str += row + '\r\n';

        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < array.length; i++) {
            let line = '';
            // tslint:disable-next-line:forin
            for (const index in array[i]) {
                if (line !== '') { line += ','; }
                line += array[i][index];
            }
            str += line + '\r\n';
        }
        return str;
    }

    private static createFileName(exportFileName: string): string {
        const date = new Date();
        return (exportFileName +
            date.toLocaleDateString() + '_' +
            date.toLocaleTimeString()
            + '.csv');
    }

}
