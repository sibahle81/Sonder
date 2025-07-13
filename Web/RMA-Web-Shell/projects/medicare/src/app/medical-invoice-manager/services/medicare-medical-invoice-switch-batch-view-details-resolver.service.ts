import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { MedicalSwitchBatchInvoice } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-switch-batch-invoice';
import { MedicareMedicalInvoiceSwitchBatchService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice-switch-batch.service';

@Injectable()
export class MedicalInvoiceSwitchBatchViewDetailsResolverService implements Resolve<MedicalSwitchBatchInvoice | string> {
    constructor(private medicareMedicalInvoiceSwitchBatchService:MedicareMedicalInvoiceSwitchBatchService,) { }

    resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<MedicalSwitchBatchInvoice | string> {
        let id = route.params.id;
        return this.medicareMedicalInvoiceSwitchBatchService.getMedicalSwitchBatchInvoices(id)
            .pipe(
                catchError((err: string) => of(err))
            );
    }
}
