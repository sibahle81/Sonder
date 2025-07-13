CREATE TABLE [common].[MonthEndRunStatus] (
    [Id]   INT          NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    CONSTRAINT [PK_common.MonthEndRunStatus] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [PK_common.MonthEndRunStatus_Name] UNIQUE NONCLUSTERED ([Name] ASC)
);

