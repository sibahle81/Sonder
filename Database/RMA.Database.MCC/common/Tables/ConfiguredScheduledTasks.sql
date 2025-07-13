CREATE TABLE [common].[ConfiguredScheduledTasks] (
    [Id]   INT          IDENTITY (1, 1) NOT NULL,
    [Name] VARCHAR (50) NULL,
    CONSTRAINT [PK_ConfiguredScheduledTasks] PRIMARY KEY CLUSTERED ([Id] ASC)
);

