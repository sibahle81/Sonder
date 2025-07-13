export class ClientCoverView {
    policyNumber: string;
    productName: string;
    productCode: string;
    productDesc: string;
    productStatus: string;
    productOptionName: string;
    benefitSetName: string;
    numberOfEmployees: string;
    premium: string;
    productOptionCover: string;


    get formattedName(): string {
        return `${this.productName} ${this.productOptionName
            ? ' (' + this.productOptionName + ' - ' + this.productOptionCover + ')'
            : ''}`;
    }
}
