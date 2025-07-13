import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PublicHoliday } from './public-holiday';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';

@Injectable()
export class PublicHolidayService {

    private apiUrl = 'mdm/api/PublicHoliday';

    constructor(
        private readonly commonService: CommonService) {
    }


    getPublicHoliday(id: any): Observable<PublicHoliday> {
        return this.commonService.get<PublicHoliday>(id, this.apiUrl);
    }

    getPublicHolidays(): Observable<PublicHoliday[]> {
        return this.commonService.getAll<PublicHoliday[]>(this.apiUrl);
    }

    addPublicHoliday(publicHoliday: PublicHoliday): Observable<number> {
        return this.commonService.postGeneric<PublicHoliday, number>(this.apiUrl, publicHoliday);
    }

    editPublicHoliday(publicHoliday: PublicHoliday): Observable<boolean> {
        return this.commonService.edit<PublicHoliday>(publicHoliday, this.apiUrl);
    }

    deletePublicHoliday(publicHoliday: PublicHoliday): Observable<boolean> {
        return this.commonService.remove(publicHoliday.id, this.apiUrl);
    }
}
