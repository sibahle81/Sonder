import { Injectable } from '@angular/core';
import { AnnouncementUserAcceptance } from 'projects/shared-models-lib/src/lib/common/AnnouncementUserAcceptance';
import { Observable } from 'rxjs';
import { CommonService } from '../common/common.service';

/** @description The default AnnouncementUserAcceptance service for the app. */
@Injectable({
    providedIn: 'root'
})
export class AnnouncementUserAcceptanceService {

    private apiUrl = 'mdm/api/AnnouncementUserAcceptance';

    constructor(private readonly commonService: CommonService) {
    }

    addAnnouncementUserAcceptance(announcementUserAcceptance: AnnouncementUserAcceptance): Observable<number> {
        return this.commonService.postGeneric<AnnouncementUserAcceptance, number>(`${this.apiUrl}/AddAnnouncementUserAcceptance`, announcementUserAcceptance);
    }
}