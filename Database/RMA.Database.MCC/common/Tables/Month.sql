CREATE TABLE [common].[Month] (
    [Id]   INT          NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    CONSTRAINT [PK_common.Month] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [PK_common.Month_Name] UNIQUE NONCLUSTERED ([Name] ASC)
);

