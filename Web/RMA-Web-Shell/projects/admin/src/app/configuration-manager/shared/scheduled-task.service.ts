import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { ScheduledTask } from './scheduled-task';

@Injectable()
export class ScheduledTasksService {

    private apiUrl = 'tsk/api/ScheduledTask';

    constructor(
        private readonly commonService: CommonService) {
    }


    getScheduledTask(id: any): Observable<ScheduledTask> {
        return this.commonService.get<ScheduledTask>(id, this.apiUrl);
    }

    getScheduledTasks(): Observable<ScheduledTask[]> {
        return this.commonService.getAll<ScheduledTask[]>(this.apiUrl);
    }

    addScheduledTask(scheduledTask: ScheduledTask): Observable<number> {
        return this.commonService.postGeneric<ScheduledTask, number>(this.apiUrl, scheduledTask);
    }

    editScheduledTask(scheduledTask: ScheduledTask): Observable<boolean> {
        return this.commonService.edit<ScheduledTask>(scheduledTask, this.apiUrl);
    }

    deleteScheduledTask(scheduledTask: ScheduledTask): Observable<boolean> {
        return this.commonService.remove(scheduledTask.scheduledTaskId, this.apiUrl);
    }
}
