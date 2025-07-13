import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { ValidityCheckSet } from 'projects/shared-models-lib/src/lib/common/validity-checkset';
import { ValidityCheckType } from 'projects/shared-models-lib/src/lib/enums/validity-check-type.enum';
import { ValidityCheckCategory } from 'projects/shared-models-lib/src/lib/common/validity-check-category';

@Injectable()
export class ValidityChecksService {
    private apiUrl = 'mdm/api/ValidityChecks';

    constructor(
        private readonly commonService: CommonService) {
    }

    getValidityChecks(checkType: ValidityCheckType): Observable<ValidityCheckSet[]> {
        const urlQuery = encodeURIComponent(checkType.toString());
        return this.commonService.getAll<ValidityCheckSet[]>(`${this.apiUrl}/GetValidityChecks/${urlQuery}`);
    }

    getValidityCheckCategories(checkType: ValidityCheckType): Observable<ValidityCheckCategory[]> {
        const urlQuery = encodeURIComponent(checkType.toString());
        return this.commonService.getAll<ValidityCheckCategory[]>(`${this.apiUrl}/GetValidityCheckCategories/${urlQuery}`);
    }
}
