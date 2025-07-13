import { Injectable } from '@angular/core';
import { Observable, merge, interval } from 'rxjs';


import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { UploadService } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.service';
import { InsuredLifeService } from '../../shared/Services/insured-life.service';
import { Import } from '../../shared/entities/import';
import { PolicyImportsService } from '../../shared/Services/policy-imports.service';
import { PolicyImportType } from '../../shared/enums/policy-import-types.enum';
import { map } from 'rxjs/operators';

@Injectable()
export class ImportInsuredLivesListDatasource extends Datasource {
    imports: Import[];
    counter = 0;

    constructor(
        private readonly appEventsManager: AppEventsManager,
        private readonly alertService: AlertService,
        private readonly policyImportService: PolicyImportsService,
        private readonly uploadService: UploadService) {
        super(appEventsManager, alertService);

        this.defaultSortColumn = 'filename';
    }

    getData(): void {
        this.startLoading('Loading insured lives imports...');
        this.counter = 0;
        this.getInsuredLivesUpload();
    }


    setupRefresh(): void {
        interval(10000).subscribe(() => {
            this.startLoading('Refreshing...');
            this.counter = 0;
            this.getInsuredLivesUpload();
        });
    }

    getInsuredLivesUpload(): void {
        this.policyImportService.getImports(PolicyImportType.InsuredLives).subscribe(
            imports => {
                this.imports = imports;
                this.combine();
            },
            error => this.showError(error));
    }

    combine(): void {
        const maxCount = this.imports.length;
        if (maxCount === 0) { this.done(); return; }
        this.imports.forEach(i => {
           // this.uploadService.getUploadFile(i.fileRefToken).subscribe(file => {
              //  i.fileName = file.name;
                this.counter++;
                if (this.counter === maxCount) { this.done(); }
           // });
        });
    }

    done(): void {
        this.dataChange.next(this.imports);
        this.stopLoading();
    }

    connect(): Observable<Import[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: Import) => {
                const searchStr = (item.fileName + item.createdBy).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }


    disconnect(): void {

    }
}
