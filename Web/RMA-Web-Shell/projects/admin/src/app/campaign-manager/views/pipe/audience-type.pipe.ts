import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'audiencetype' })
export class AudienceTypePipe implements PipeTransform {

    transform(value: string, remove: string[] = []): string {
        value = this.removeLead(value, remove);
        const values = value.match(/[A-Z][a-z]+|[0-9]+/g);
        const result = values ? values.join(' ') : '...';
        return result;
    }

    removeLead(value: string, remove: string[]): string {
        if (remove.length == 0) { return value; }
        const startValue = this.getLead(value, remove);
        if (startValue === '') { return value; }
        value = value.substring(startValue.length).trim();
        return value;
    }

    getLead(value: string, remove: string[]): string {
        for (let i = 0; i < remove.length; i++) {
            const val = remove[i];
            if (value.startsWith(val) && value.length > val.length) {
                return val;
            }
        }
        return '';
    }
}
