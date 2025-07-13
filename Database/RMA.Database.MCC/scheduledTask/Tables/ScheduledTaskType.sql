CREATE TABLE [scheduledTask].[ScheduledTaskType] (
    [ScheduledTaskTypeId]      INT            NOT NULL,
    [Description]              VARCHAR (255)  NOT NULL,
    [Category]                 VARCHAR (255)  NOT NULL,
    [IsEnabled]                BIT            NOT NULL,
    [NumberOfRetriesRemaining] INT            NOT NULL,
    [Priority]                 INT            NULL,
    [TaskHandler]              VARCHAR (1000) NULL,
    CONSTRAINT [PK_ScheduledTaskType.ScheduledTaskType] PRIMARY KEY CLUSTERED ([ScheduledTaskTypeId] ASC)
);


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'TaskHandler';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'TaskHandler';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'TaskHandler';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'TaskHandler';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'TaskHandler';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'TaskHandler';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'ScheduledTaskTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'ScheduledTaskTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'ScheduledTaskTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'ScheduledTaskTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'ScheduledTaskTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'ScheduledTaskTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'Priority';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'Priority';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'Priority';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'Priority';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'Priority';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'Priority';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'NumberOfRetriesRemaining';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'NumberOfRetriesRemaining';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'NumberOfRetriesRemaining';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'NumberOfRetriesRemaining';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'NumberOfRetriesRemaining';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'NumberOfRetriesRemaining';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'IsEnabled';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'IsEnabled';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'IsEnabled';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'IsEnabled';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'IsEnabled';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'IsEnabled';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'Category';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'Category';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'Category';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'Category';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'Category';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'scheduledTask', @level1type = N'TABLE', @level1name = N'ScheduledTaskType', @level2type = N'COLUMN', @level2name = N'Category';

