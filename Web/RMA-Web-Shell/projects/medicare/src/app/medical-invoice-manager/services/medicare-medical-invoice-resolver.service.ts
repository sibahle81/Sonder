import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { InvoiceDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-details';
import { MedicareMedicalInvoiceCommonService } from './medicare-medical-invoice-common.service';
import { SwitchBatchType } from '../../shared/enums/switch-batch-type';
import { TebaInvoiceService } from './teba-invoice.service';
import { MedicareUtilities } from '../../shared/medicare-utilities';

@Injectable()
export class MedicalInvoiceDetailsResolverService implements Resolve<InvoiceDetails | string> {
    constructor(private medicareMedicalInvoiceCommonService: MedicareMedicalInvoiceCommonService, private tebaInvoiceService: TebaInvoiceService) { }

    resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<InvoiceDetails | string> {
        let id = route.params.id;
        let switchBatchType: SwitchBatchType = +route.params.switchBatchType;

        switch (switchBatchType) {

            case SwitchBatchType.MedEDI:
                return this.medicareMedicalInvoiceCommonService.getInvoiceDetails(id)
                    .pipe(
                        catchError((err: string) => {
                            return of(err);
                        })
                    );
                break;
            case SwitchBatchType.Teba:
                //convert before returning
                return this.tebaInvoiceService.getTebaInvoice(id).pipe(
                    map(value => {
                        if (typeof value === 'string') {
                            // If it's a string, return error message
                            return value;
                        } else {
                            // TebaInvoice  to InvoiceDetails
                            const transformed: InvoiceDetails = MedicareUtilities.convertTebaInvoiceToInvoiceDetails(value)
                            return transformed;
                        }
                    })
                );
                break;
            default:
                break;
        }

    }
}
