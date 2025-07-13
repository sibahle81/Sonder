import { ScheduledTaskType } from './scheduled-task-type';

export class ScheduledTask{
    scheduledTaskId: number;
    scheduledTaskTypeId: number;
    taskScheduleFrequency: number;
    scheduledDate:Date;
    lastRun: Date;
    lastRunDurationSeconds: number;
    lastStatus: string;
    lastReason: string;
    hostName:string
    dateTimeLockedToHost: Date;
    numberOfRetriesRemaining: number;
    priority:number;
    scheduledTaskType:ScheduledTaskType;
}