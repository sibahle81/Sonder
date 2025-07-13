export class BeneficiaryProduct {
    productId: number;
    name: string;
    checked = false;

    constructor(productId: number, name: string) {
        this.productId = productId;
        this.name = name;
    }
}
