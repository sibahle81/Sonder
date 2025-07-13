import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PreAuthorisation } from '../models/preauthorisation';
import { MediCarePreAuthService } from '../services/medicare-preauth.service';

@Injectable()
export class PreAuthDataSource extends PreAuthorisation
{
    loadingSubject: any;
    data: PreAuthorisation;
    constructor(
        private readonly mediCarePreAuthService: MediCarePreAuthService
    ) {
        super();
    }

    getData(preAuthorisationId: number)
    { 
        this.mediCarePreAuthService.getPreAuthorisationById(preAuthorisationId).pipe(
            catchError(() => of([]))
        ).subscribe(result => {
            this.data = result as PreAuthorisation;
        });
    }
}