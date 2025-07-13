import { Observable } from 'rxjs';

export class ValidationResult {
    name: string;
    isPending: boolean;
    statusChange: Observable<any>;
    errorMessages: string[];

    errors: number;

    public get valid(): boolean {
        return this.errors === 0;
    }

    constructor(name: string) {
        this.name = name;
        this.errors = 0;
        this.errorMessages = [];
    }

    public get errorMessage(): string {
        if (this.errorMessages !== undefined && this.errorMessages.length > 0) {
            let message = '';
            this.errorMessages.forEach(msg => {
                message = message + msg + ' ';
            });
            return message;
        } else {
            return null;
        }
    }
}
