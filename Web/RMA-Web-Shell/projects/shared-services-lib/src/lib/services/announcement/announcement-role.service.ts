import { Injectable } from '@angular/core';
import { AnnouncementRole } from 'projects/shared-models-lib/src/lib/common/announcement-role';
import { Observable } from 'rxjs';
import { CommonService } from '../common/common.service';

@Injectable({
    providedIn: 'root'
  })

export class AnnouncementRoleService {
    private apiUrl = 'mdm/api/AnnouncementRole';

    constructor(private readonly commonService: CommonService) {
    }

    addAnnouncementRole(announcementRole: AnnouncementRole): Observable<number> {
        return this.commonService.postGeneric<AnnouncementRole, number>(`${this.apiUrl}`, announcementRole);
    }

    editAnnouncementRole(announcementRole: AnnouncementRole): Observable<boolean> {
        return this.commonService.edit<AnnouncementRole>(announcementRole, `${this.apiUrl}`);
    }

    removeAnnouncementRolesByAnnouncementId(announcementId: number): Observable<boolean> {
        return this.commonService.remove(announcementId, `${this.apiUrl}/RemoveAnnouncementRolesByAnnouncementId`);
    }

    getAnnouncementRolesByAnnouncementId(announcementId: number): Observable<AnnouncementRole[]> {
        return this.commonService.getAll<AnnouncementRole[]>(`${this.apiUrl}/GetAnnouncementRolesByAnnouncementId/${announcementId}`);
    }
}