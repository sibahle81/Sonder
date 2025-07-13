export class InsuredLifeProduct {
    checked = false;
    enabled = true;
    constructor(public productId: number, public name: string, public productOptionCoverId: number, public productOptionId: number) {
    }
}
