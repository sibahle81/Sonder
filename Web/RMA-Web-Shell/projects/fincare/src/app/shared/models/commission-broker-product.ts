export class CommissionBrokerProduct {
    constructor(
        public productId: number,
        public productName: string,
        public isFitAndProper: boolean,
        public fitAndProperCheckDate: Date) { }
}
