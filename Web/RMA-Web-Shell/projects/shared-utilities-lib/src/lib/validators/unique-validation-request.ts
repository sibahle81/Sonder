export class UniqueValidationRequest {
    constructor(public field: string, public table: string, public value: string, public metaValue: string) {
    }
}
