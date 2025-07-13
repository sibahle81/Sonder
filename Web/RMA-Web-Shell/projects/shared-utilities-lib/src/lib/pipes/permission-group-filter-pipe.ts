import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({
    name: 'permissionGroupFilter'
})
@Injectable()
export class PermissionGroupFilterPipe implements PipeTransform {
    transform(items: Array<any>, moduleId: number): Array<any> {
        return items.filter(item => item.moduleId === moduleId);
    }
}
