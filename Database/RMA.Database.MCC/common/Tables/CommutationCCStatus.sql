﻿CREATE TABLE [common].[CommutationCCStatus] (
    [Id]   INT          IDENTITY (1, 1) NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    CONSTRAINT [PK_CommutationCCStatus] PRIMARY KEY CLUSTERED ([Id] ASC)
);

