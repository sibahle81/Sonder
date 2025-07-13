import { PipeTransform, Pipe } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { MedicalInvoiceLineItem } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-line-item';


@Pipe({
    name: 'invoiceTotalsCalculations',
    pure: false,
    standalone: true,
})
export class MedicalInvoiceTotalsCalculationsPipe implements PipeTransform {

    private vatTotal = 0;
    transform(invoiceLineItems: MedicalInvoiceLineItem[], totalCalculateType: string, healthCareProvidersVatAmount: number): number {

        if (!isNullOrUndefined(invoiceLineItems)) {
            switch (totalCalculateType) {
                //----------for list
                case 'getTotalIncl':
                    const totalInc = invoiceLineItems.map(t => (t.requestedAmount * t.requestedQuantity) + t.requestedVat - t.creditAmount).reduce((acc, value) => acc + value, 0);
                    return totalInc;

                case 'getTotalVAT':
                    this.vatTotal = invoiceLineItems.map(t => t.requestedVat * t.requestedQuantity).reduce((acc, value) => acc + value, 0);
                    return this.vatTotal;

                case 'getTarrifTotal':
                    const totalTariffAmount = invoiceLineItems.map(t => t.totalTariffAmount).reduce((acc, value) => acc + value, 0);
                    return totalTariffAmount;

                case 'getQuantity':
                    const quantity = invoiceLineItems.map(t => t.requestedQuantity).reduce((acc, value) => acc + value, 0);
                    return quantity;

                case 'getRequestedAmountEx':
                    let requestedAmountEx: number = 0;
                    invoiceLineItems.forEach(a => requestedAmountEx += a.requestedAmount * a.requestedQuantity);
                    return requestedAmountEx

                case 'getTotalAssessInc':
                    let totalAssessInc: number = 0;
                    invoiceLineItems.forEach(a => totalAssessInc += a.authorisedAmountInclusive);
                    return totalAssessInc;
                //-----------for list end

                //-----------for capture
                case 'getSubTotalEx':
                    let subTotalEx: number = 0;
                    if (healthCareProvidersVatAmount == undefined)
                        healthCareProvidersVatAmount = 0;
                    invoiceLineItems.forEach(a => subTotalEx += (a.totalTariffAmount * a.requestedQuantity) - a.creditAmount -
                        this.getVatFromTotal(a.totalTariffAmount, a.requestedQuantity, healthCareProvidersVatAmount));
                    return subTotalEx;

                case 'captureGetTotalIncl':
                    const captureGetTotalIncl = invoiceLineItems.map(t => (t.totalTariffAmount * t.requestedQuantity) - t.creditAmount).reduce((acc, value) => acc + value, 0);
                    return captureGetTotalIncl;

                case 'captureGetTotalVAT':
                        const vatTotal = invoiceLineItems.map(t => t.totalTariffVat * t.requestedQuantity).reduce((acc, value) => acc + value, 0);
                        return vatTotal;
                //--------for capture end
                //--------for view & list & batch
                case 'getTotalInclRequested':
                    const totalIncValue = invoiceLineItems.map(t => t.requestedAmount).reduce((acc, value) => acc + value, 0);
                    return totalIncValue;
                //--------for view & list & batch end
                default:
                    return 0;

            }
        }

    }

    getVatFromTotal(total: number, quantity: number, healthCareProvidersVatAmount) {
        let vatOnly = total * healthCareProvidersVatAmount / 100;
        let totalVatAmount = vatOnly * quantity;
        return totalVatAmount;
    }
}

