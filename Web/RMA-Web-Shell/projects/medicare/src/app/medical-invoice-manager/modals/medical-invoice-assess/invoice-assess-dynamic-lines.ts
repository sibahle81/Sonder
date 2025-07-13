import { InvoiceLineDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-line-details';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

export class InvoiceAssessDynamicLines extends InvoiceLineDetails {

    //include and exclude allocationFields FormArray - FormGroup
    //For allocationFields FormArray - FormGroup
    static asFormGroup(allocationFields: InvoiceLineDetails): UntypedFormGroup {
        const formGroupControls = new UntypedFormGroup({
            description: new UntypedFormControl(allocationFields.description),
            serviceTimeStart: new UntypedFormControl(allocationFields.serviceTimeStart),
            serviceTimeEnd: new UntypedFormControl(allocationFields.serviceTimeEnd),
            requestedAmountInclusive: new UntypedFormControl(allocationFields.requestedAmountInclusive),
            authorisedAmount: new UntypedFormControl(allocationFields.authorisedAmount),
            //exclude
            exclude: new UntypedFormControl(),
            //reason textarea box
            underAssessReason: new UntypedFormControl(""),
            //Include
            include: new UntypedFormControl(),
            tariffAmount: new UntypedFormControl(allocationFields.tariffAmount),
            requestedQuantity: new UntypedFormControl(allocationFields.requestedQuantity),
            defaultQuantity: new UntypedFormControl(allocationFields.defaultQuantity),
            hcpTariffCode: new UntypedFormControl(allocationFields.hcpTariffCode),
            serviceDate: new UntypedFormControl(allocationFields.serviceDate),
            authorisedAmountInclusive: new UntypedFormControl(""),
            authorisedQuantity: new UntypedFormControl(""),

            authorisedVat: new UntypedFormControl(allocationFields.authorisedVat),
            requestedVat: new UntypedFormControl(allocationFields.requestedVat),
            requestedAmount: new UntypedFormControl(allocationFields.requestedAmount),
            underAssessReasons: new UntypedFormControl(allocationFields.invoiceLineUnderAssessReasons),
        });
        return formGroupControls;
    }

}
