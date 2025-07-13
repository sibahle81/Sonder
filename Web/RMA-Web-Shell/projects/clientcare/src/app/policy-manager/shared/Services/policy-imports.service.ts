import { Injectable } from '@angular/core';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { ImportRequest } from '../entities/import-request';
import { Observable } from 'rxjs';
import { Import } from '../entities/import';
import { PolicyImportType } from '../enums/policy-import-types.enum';
import { ImportLog } from '../entities/import-log';

@Injectable({
    providedIn: 'root'
})
export class PolicyImportsService {
    private apiUrl = 'clc/api/Policy';

    constructor(private readonly commonService: CommonService) {
    }

    importFile(importRequest: ImportRequest): Observable<boolean> {
        return this.commonService.postGeneric<ImportRequest, boolean>(`${this.apiUrl}/Import`, importRequest);
    }

    getImports(importType: PolicyImportType): Observable<Import[]> {
        return this.commonService.getAll(`${this.apiUrl}/Import/${importType}`);
    }

    cancelInsuredLifeImport(item: Import): Observable<boolean> {
        return this.commonService.edit(item,  `${this.apiUrl}/Import/Cancel`);
    }

    deleteInsuredLifeImport(id: number): Observable<boolean> {
        return this.commonService.remove(id, `${this.apiUrl}/Import`);
    }


    getReport(importId: number): Observable<ImportLog[]> {
        return this.commonService.getAll(`${this.apiUrl}/Import/ImportLogs/${importId}`);
    }
}
