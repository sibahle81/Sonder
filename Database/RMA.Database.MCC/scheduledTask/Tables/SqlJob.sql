CREATE TABLE [scheduledTask].[SqlJob] (
    [SqlJobId]                 INT            NOT NULL,
    [ScheduledTaskId]          INT            NOT NULL,
    [HostName]                 VARCHAR (255)  NOT NULL,
    [SqlJobQueryText]          VARCHAR (1000) NOT NULL,
    [NumberOfRetriesRemaining] INT            CONSTRAINT [DF__SqlJob__NumberOf__2CDD9F46] DEFAULT ((3)) NOT NULL,
    [Priority]                 BIT            CONSTRAINT [DF__SqlJob__Priority__2DD1C37F] DEFAULT ((1)) NOT NULL,
    CONSTRAINT [PK_SqlJob.SqlJob] PRIMARY KEY CLUSTERED ([SqlJobId] ASC),
    CONSTRAINT [FK__SqlJob__Schedule__2EC5E7B8] FOREIGN KEY ([ScheduledTaskId]) REFERENCES [scheduledTask].[ScheduledTask] ([ScheduledTaskId])
);


GO

GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'SqlJobQueryText';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'SqlJobQueryText';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'SqlJobQueryText';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'SqlJobQueryText';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'SqlJobQueryText';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'SqlJobQueryText';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'SqlJobId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'SqlJobId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'SqlJobId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'SqlJobId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'SqlJobId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'SqlJobId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'ScheduledTaskId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'ScheduledTaskId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'ScheduledTaskId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'ScheduledTaskId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'ScheduledTaskId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'ScheduledTaskId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'Priority';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'Priority';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'Priority';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'Priority';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'Priority';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'Priority';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'NumberOfRetriesRemaining';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'NumberOfRetriesRemaining';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'NumberOfRetriesRemaining';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'NumberOfRetriesRemaining';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'NumberOfRetriesRemaining';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'NumberOfRetriesRemaining';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'HostName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'HostName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'HostName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'HostName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'HostName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'SqlJob', @level2type = N'COLUMN', @level2name = N'HostName';

