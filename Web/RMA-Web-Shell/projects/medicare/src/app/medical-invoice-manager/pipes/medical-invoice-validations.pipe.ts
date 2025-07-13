import { PipeTransform, Pipe } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { MedicalInvoiceLineItem } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-line-item';
import { ValidationStateEnum } from '../enums/validation-state-enum';
import { InvoiceDetails } from '../models/medical-invoice-details';
import { InvoiceLineDetails } from '../models/medical-invoice-line-details';


@Pipe({
    name: 'medicalInvoiceValidations',
    pure: true,
    standalone: true,
})
export class MedicalInvoiceValidationsPipe implements PipeTransform {

    private vatTotal = 0;
    public validationStateEnum: typeof ValidationStateEnum = ValidationStateEnum;

    transform(invoiceData: InvoiceDetails | InvoiceLineDetails, underAssessReasonType: string, validationType: string, index: number): string {
        
        if (!isNullOrUndefined(invoiceData)) {
            switch (underAssessReasonType) {

                //for invoice validations 
                case this.validationStateEnum[5]:
                    if (validationType == this.validationStateEnum[1]) {
                        return this.invoiceUnderAssessReasonsDisplay(invoiceData, this.validationStateEnum[1]);
                    }
                    else if (validationType == this.validationStateEnum[2]) {
                        return this.invoiceUnderAssessReasonsDisplay(invoiceData, this.validationStateEnum[2]);
                    }
                    break;

                //for invoiceLine Validations
                case this.validationStateEnum[6]:
                    if (validationType == this.validationStateEnum[1]) {
                        return this.invoiceLineUnderAssessReasonsDisplay(invoiceData, index)
                    }
                    else if (validationType == this.validationStateEnum[2]) {
                        return this.invoiceLineUnderAssessReasonsDisplay(invoiceData, index)
                    }

                //for determining validation markers
                case 'invoiceLineUnderAssessIcon':
                    if (validationType == this.validationStateEnum[3]) {
                        return this.invoiceLineUnderAssessReasonsIconDisplay(this.validationStateEnum[3])
                    }
                    else if (validationType == this.validationStateEnum[4]) {
                        return this.invoiceLineUnderAssessReasonsIconDisplay(this.validationStateEnum[4])
                    }

                    break;

                default:
                    return "";
            }
        }

    }

    invoiceUnderAssessReasonsDisplay(invoiceData, displayType): string {
        let shortText: any[] = [];
        let part = "";
        invoiceData.invoiceUnderAssessReasons.forEach(element => {
            shortText.push(element.underAssessReason);
        });

        let text = shortText.join(" &; ");

        if (displayType == this.validationStateEnum[2]) {
            part = text.substring(0, 30);
        }
        else {
            part = text;
        }

        return part;
    }

    invoiceLineUnderAssessReasonsDisplay(invoiceLineDetails, index): string {
        let shortText: any[] = [];
        if (invoiceLineDetails && invoiceLineDetails?.invoiceLineUnderAssessReasons?.length > 0) {
            //when there are validation issues 
            let lineUnderAssessReasons = invoiceLineDetails.invoiceLineUnderAssessReasons;
            for (let i = 0; i < lineUnderAssessReasons.length; i++) {
                shortText.push(lineUnderAssessReasons[i].underAssessReason);
            }
        }
        
        let text = shortText.join(" &; ");
        return text;
    }

    invoiceLineUnderAssessReasonsIconDisplay(validationState): string {

        switch (validationState) {
            case this.validationStateEnum[3]:
                return "done";

            case this.validationStateEnum[4]:
                return "close";

            default:
                break;
        }

    }
}

