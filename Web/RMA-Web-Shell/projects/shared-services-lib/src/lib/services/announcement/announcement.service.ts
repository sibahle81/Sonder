
import { Injectable } from '@angular/core';
import { Announcement } from 'projects/shared-models-lib/src/lib/common/announcement';
import { Observable } from 'rxjs';
import { CommonService } from '../common/common.service';
import { PagedRequestResult } from './../../../../../shared-models-lib/src/lib/pagination/PagedRequestResult';

/** @description The default announcement service for the app. */
@Injectable({
    providedIn: 'root'
})
export class AnnouncementService {
    private apiUrl = 'mdm/api/Announcement';

    constructor(private readonly commonService: CommonService) {
    }

    addAnnouncement(announcement: Announcement): Observable<number> {
        return this.commonService.postGeneric<Announcement, number>(`${this.apiUrl}`, announcement);
    }

    editAnnouncement(announcement: Announcement): Observable<boolean> {
        return this.commonService.edit<Announcement>(announcement, `${this.apiUrl}`);
    }

    getAnnouncements(): Observable<Announcement[]> {
        return this.commonService.getAll<Announcement[]>(`${this.apiUrl}/GetAnnouncements`);
    }

    getPagedAnnouncements(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string): Observable<PagedRequestResult<Announcement>> {
        return this.commonService.getAll<PagedRequestResult<Announcement>>(`${this.apiUrl}/GetPagedAnnouncements/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}`);
    }

    getAnnouncementCountForUserId(userId: number): Observable<number> {
        return this.commonService.getAll<number>(`${this.apiUrl}/GetAnnouncementCountForUserId/${userId}`);
    }

    getAnnouncementsByUserId(userId: number): Observable<Announcement[]> {
        return this.commonService.getAll<Announcement[]>(`${this.apiUrl}/GetAnnouncementsByUserId/${userId}`);
    }
}