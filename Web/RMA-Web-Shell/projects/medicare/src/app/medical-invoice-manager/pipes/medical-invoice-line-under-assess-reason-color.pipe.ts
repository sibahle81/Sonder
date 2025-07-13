import { PipeTransform, Pipe } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { UnderAssessReasonEnum } from '../enums/under-assess-reason.enum';

@Pipe({
    name: 'invoiceLineUnderAssessReasonColor',
    pure: false,
    standalone: true,
})
export class MedicalInvoiceLineUnderAssessReasonColorPipe implements PipeTransform {

    public invoiceLineUnderAssessReasonEnum: typeof UnderAssessReasonEnum = UnderAssessReasonEnum;
    underAssessReasonColor: string = "";

    transform(LineUnderAssessReasons): string {
        let displayedUnderAssessReasonId = [];

        if (LineUnderAssessReasons.invoiceLineUnderAssessReasons.length > 0) {
            LineUnderAssessReasons.invoiceLineUnderAssessReasons.forEach(element => {
                // Comes from displayed - assess reasons for line
                displayedUnderAssessReasonId.push(element.underAssessReasonId);
            });
        }

        // Create a Map - //for order precedence
        const underAssessReasonOrder = new Map([
            [1, this.invoiceLineUnderAssessReasonEnum.invoiceIsADuplicate],
            [2, this.invoiceLineUnderAssessReasonEnum.lineItemRateExceedsTheAgreedTariff],
            [3, this.invoiceLineUnderAssessReasonEnum.noMedicalCover],
            [4, this.invoiceLineUnderAssessReasonEnum.noPreAuthorisationObtained],
            [5, this.invoiceLineUnderAssessReasonEnum.thisCodeWillNotBePaidItIsMutuallyExclusiveWithAnotherCodeForThisDateOfService],
            [6, this.invoiceLineUnderAssessReasonEnum.lineItemQuantityPayLimitReachedPaidQuantityIsMoreThanAuthorisedPayLimit],
        ]);

        //convert map Values to array
        const underAssessReasonOrderValues = Array.from(underAssessReasonOrder.values());
        //merge the 2 arrays
        const mergedArrays = underAssessReasonOrderValues.concat(displayedUnderAssessReasonId);
        //get unique values from merged
        const uniqueValues = new Set(mergedArrays);
        //dedup to get intersect
        const intersectValues = mergedArrays.filter(item => {
            if (uniqueValues.has(item)) {
                uniqueValues.delete(item);
            } else {
                return item;
            }
        });
        if (intersectValues.length > 0) {
            // Create a Map - for intersect precedence
            const underAssessReasonOrderSortedMap = new Map();

            for (let index = 0; index < intersectValues.length; index++) {

                for (const x of underAssessReasonOrder.entries()) {

                    if (x[1] == intersectValues[index]) {
                        underAssessReasonOrderSortedMap.set(x[0], x[1]);
                    }
                }
            }

            let underAssessReasonOrderSortedMapEntries = new Map([...underAssessReasonOrderSortedMap.entries()].sort());
            const first = [...underAssessReasonOrderSortedMapEntries][0];
            this.underAssessReasonColor = this.GetColourForAssessment(first[0]);
        }

        return this.underAssessReasonColor

    }


    GetColourForAssessment(LineUnderAssessReasonID) {

        switch (LineUnderAssessReasonID) {
            // **UnderAssessReason in order of precedence**
            case this.invoiceLineUnderAssessReasonEnum.invoiceIsADuplicate:
                this.underAssessReasonColor = 'Red';
                break;
            case this.invoiceLineUnderAssessReasonEnum.lineItemRateExceedsTheAgreedTariff:
                this.underAssessReasonColor = 'Orange';
                break;
            case this.invoiceLineUnderAssessReasonEnum.noMedicalCover:
                this.underAssessReasonColor = 'Pink';
                break;
            case this.invoiceLineUnderAssessReasonEnum.noPreAuthorisationObtained:
                this.underAssessReasonColor = 'Purple';
                break;
            //waiting confirmation from business
            case this.invoiceLineUnderAssessReasonEnum.thisCodeWillNotBePaidItIsMutuallyExclusiveWithAnotherCodeForThisDateOfService:
                this.underAssessReasonColor = 'Yellow';
                break;
            //waiting confirmation from business
            case this.invoiceLineUnderAssessReasonEnum.lineItemQuantityPayLimitReachedPaidQuantityIsMoreThanAuthorisedPayLimit:
                this.underAssessReasonColor = '';
                break;
            default:
                this.underAssessReasonColor = 'Black';
                break;
        }
        return this.underAssessReasonColor;
    }

}
