CREATE TABLE [common].[CommutationSchedule] (
    [Id]   INT          IDENTITY (1, 1) NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    CONSTRAINT [PK_CommutationSchedule] PRIMARY KEY CLUSTERED ([Id] ASC)
);

