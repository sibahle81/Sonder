export class ProgressMessage {
    message: string;
    progress: number;

    constructor(message: string, progress: number) {
        this.message = message;
        this.progress = progress;
    }
}
