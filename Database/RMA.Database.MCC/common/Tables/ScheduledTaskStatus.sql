CREATE TABLE [common].[ScheduledTaskStatus] (
    [Id]   INT          IDENTITY (1, 1) NOT NULL,
    [Name] VARCHAR (50) NULL,
    CONSTRAINT [PK_ScheduledTaskStatus] PRIMARY KEY CLUSTERED ([Id] ASC)
);

