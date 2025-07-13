CREATE TABLE [scheduledTask].[ScheduledTask] (
    [ScheduledTaskId]          INT           IDENTITY (1, 1) NOT NULL,
    [ScheduledTaskTypeId]      INT           NOT NULL,
    [TaskScheduleFrequencyId]  INT           NOT NULL,
    [ScheduledDate]            DATETIME      NOT NULL,
    [LastRun]                  DATETIME      NULL,
    [LastRunDurationSeconds]   INT           NULL,
    [LastStatus]               VARCHAR (255) NULL,
    [HostName]                 VARCHAR (255) NULL,
    [LastReason]               VARCHAR (255) NULL,
    [DateTimeLockedToHost]     DATETIME      NULL,
    [NumberOfRetriesRemaining] INT           CONSTRAINT [DF__Scheduled__Numbe__150615B5] DEFAULT ((3)) NOT NULL,
    [Priority]                 BIT           CONSTRAINT [DF__Scheduled__Prior__15FA39EE] DEFAULT ((1)) NOT NULL,
    CONSTRAINT [PK_ScheduledTask.ScheduledTask] PRIMARY KEY CLUSTERED ([ScheduledTaskId] ASC),
    CONSTRAINT [FK__Scheduled__Sched__216BEC9A] FOREIGN KEY ([ScheduledTaskTypeId]) REFERENCES [scheduledTask].[ScheduledTaskType] ([ScheduledTaskTypeId]),
    CONSTRAINT [FK_ScheduledTask_TaskScheduleFrequency] FOREIGN KEY ([TaskScheduleFrequencyId]) REFERENCES [common].[TaskScheduleFrequency] ([Id])
);


GO

GO

GO

GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'TaskScheduleFrequencyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'TaskScheduleFrequencyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'TaskScheduleFrequencyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'TaskScheduleFrequencyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'TaskScheduleFrequencyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'TaskScheduleFrequencyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'ScheduledTaskTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'ScheduledTaskTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'ScheduledTaskTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'ScheduledTaskTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'ScheduledTaskTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'ScheduledTaskTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'ScheduledTaskId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'ScheduledTaskId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'ScheduledTaskId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'ScheduledTaskId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'ScheduledTaskId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'ScheduledTaskId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'ScheduledDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'ScheduledDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'ScheduledDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'ScheduledDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'ScheduledDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'ScheduledDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'Priority';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'Priority';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'Priority';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'Priority';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'Priority';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'Priority';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'NumberOfRetriesRemaining';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'NumberOfRetriesRemaining';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'NumberOfRetriesRemaining';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'NumberOfRetriesRemaining';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'NumberOfRetriesRemaining';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'NumberOfRetriesRemaining';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'LastStatus';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'LastStatus';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'LastStatus';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'LastStatus';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'LastStatus';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'LastStatus';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'LastRunDurationSeconds';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'LastRunDurationSeconds';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'LastRunDurationSeconds';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'LastRunDurationSeconds';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'LastRunDurationSeconds';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'LastRunDurationSeconds';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'LastRun';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'LastRun';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'LastRun';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'LastRun';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'LastRun';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'LastRun';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'LastReason';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'LastReason';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'LastReason';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'LastReason';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'LastReason';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'LastReason';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'HostName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'HostName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'HostName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'HostName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'HostName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'HostName';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'DateTimeLockedToHost';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'DateTimeLockedToHost';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'DateTimeLockedToHost';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'DateTimeLockedToHost';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'DateTimeLockedToHost';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTask', @level2type = N'COLUMN', @level2name = N'DateTimeLockedToHost';

