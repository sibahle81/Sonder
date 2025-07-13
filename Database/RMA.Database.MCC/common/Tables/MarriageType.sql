CREATE TABLE [common].[MarriageType] (
    [Id]   INT          NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    CONSTRAINT [PK_common.MarriageType] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [AK_common.MarriageType_Name] UNIQUE NONCLUSTERED ([Name] ASC)
);

