import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FollowUp } from '../entities/follow-up';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Injectable(
    {
        providedIn: 'root'
    }
)
export class FollowUpService {

    private apiFollowUp = 'mdm/api/FollowUp';

    constructor(private readonly commonService: CommonService,
                private readonly authService: AuthService) {
    }

    getFollowUp(id: number): Observable<FollowUp> {
        return this.commonService.get<FollowUp>(id, `${this.apiFollowUp}`);
    }

    searchFollowUps(query: string): Observable<FollowUp[]> {
        const urlQuery = encodeURIComponent(query);
        return this.commonService.getAll<FollowUp[]>(`${this.apiFollowUp}/searchFollowUps${urlQuery}`);
    }

    getLastViewdFollowUps(): Observable<FollowUp[]> {
        const user = this.authService.getUserEmail();
        return this.commonService.getAll<FollowUp[]>(`${this.apiFollowUp}/getLastViewdFollowUps${user}`);
    }

    getFollowUps(): Observable<FollowUp[]> {
        return this.commonService.getAll<FollowUp[]>(`${this.apiFollowUp}`);
    }
    getActiveFollowUps(): Observable<FollowUp[]> {
        return this.commonService.getAll<FollowUp[]>(`${this.apiFollowUp}/GetActiveFollowUps`);
    }

    addFollowUp(followUp: FollowUp): Observable<number> {
        return this.commonService.postGeneric<FollowUp, number>(`${this.apiFollowUp}`, followUp);
    }

    editFollowUp(followUp: FollowUp): Observable<boolean> {
        return this.commonService.edit<FollowUp>(followUp, `${this.apiFollowUp}`);
    }

    removeFollowUp(id: number): Observable<boolean> {
        return this.commonService.remove(id, `${this.apiFollowUp}`);
    }
}
