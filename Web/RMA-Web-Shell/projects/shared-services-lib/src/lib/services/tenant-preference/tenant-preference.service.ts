import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { TenantPreferences } from 'projects/shared-models-lib/src/lib/security/tenant-preferences';
import { TenantPreferenceRequest } from 'projects/shared-models-lib/src/lib/security/tenant-preference-request';

@Injectable()
export class TenantPreferenceService {
    private apiUrl = 'sec/api/TenantPreference';

    constructor(private readonly commonService: CommonService,
                private readonly authService: AuthService) {
    }

    saveTenantPreferances(preference: TenantPreferences, tenantId: number): Observable<boolean> {
        const request = new TenantPreferenceRequest();
        request.tenantId = tenantId;
        request.preferences = JSON.stringify(preference);
        request.createdBy = this.authService.getCurrentUser().email;
        request.modifiedBy = this.authService.getCurrentUser().email;
        return this.commonService.postGeneric<TenantPreferenceRequest, boolean>(this.apiUrl, request);
    }

    getTenantPreferences(tenantId: number): Observable<TenantPreferenceRequest> {
      return this.commonService.get<TenantPreferenceRequest>(tenantId, `${this.apiUrl}/ByTenantId`);
    }
}
