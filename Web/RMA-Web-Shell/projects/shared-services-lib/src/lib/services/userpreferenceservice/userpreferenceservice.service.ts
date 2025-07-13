import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserPreferences } from 'projects/shared-models-lib/src/lib/security/user-preferences';
import { UserPreferenceRequest } from 'projects/shared-models-lib/src/lib/security/userpreferencerequest';

@Injectable()
export class UserPreferenceService {
    private apiUrl = 'sec/api/UserPreference';

    constructor(private readonly commonService: CommonService,
                private readonly authService: AuthService) {

    }

    saveUserPreferances(preference: UserPreferences): Observable<boolean> {
        const request = new UserPreferenceRequest();
        request.userId = this.authService.getCurrentUser().id;
        request.preferences = JSON.stringify(preference);
        request.createdBy = this.authService.getCurrentUser().email;
        request.modifiedBy = this.authService.getCurrentUser().email;
        return this.commonService.postGeneric<UserPreferenceRequest, boolean>(this.apiUrl, request);
    }

    getUserPreferences(userId: number): Observable<UserPreferenceRequest> {
      return this.commonService.get<UserPreferenceRequest>(userId, `${this.apiUrl}/ForUser`);
    }
}
