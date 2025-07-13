import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { AuthService } from "projects/shared-services-lib/src/lib/services/security/auth/auth.service";
import { CommonService } from "projects/shared-services-lib/src/lib/services/common/common.service";
import { Industry } from "../../../client-manager/shared/Entities/industry";

@Injectable({
    providedIn: 'root'
})
export class IndustryService {

    private api = 'mdm/api/Industry/';

    constructor(
        private readonly commonService: CommonService,
        private readonly authService: AuthService) {
    }

    getIndustries(): Observable<Industry[]> {
        return this.commonService.getAll<Industry[]>(this.api);
    }
}