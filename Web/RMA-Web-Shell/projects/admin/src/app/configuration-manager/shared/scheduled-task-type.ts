export class ScheduledTaskType{
    scheduledTaskTypeId: number;
    name: string;
    description: string;
    category: string;
    isEnabled:boolean;
    numberOfRetriesRemaining:number;
    priority: number;
    taskHandler: string;
}