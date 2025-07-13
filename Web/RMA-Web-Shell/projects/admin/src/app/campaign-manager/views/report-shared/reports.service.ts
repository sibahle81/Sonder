import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Retention} from './retention';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';

@Injectable()
export class CampaignReportService {

    constructor(
        private readonly commonService: CommonService
    ) {
    }

    getRetentions(): Observable<Retention[]> {
        const list: Retention[] = [
            { clientId: 1, clientName: 'Anglo American'},
            { clientId: 2, clientName: 'DC Universe' },
            { clientId: 3, clientName: 'Do Marvel' }
        ];
        // return Observable.of(list);
        return this.commonService.getAll<Retention[]>('Campaign');
    }
}
