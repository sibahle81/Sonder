﻿CREATE TABLE [common].[EntryType] (
    [Id]   INT          IDENTITY (1, 1) NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    CONSTRAINT [PK_EntryType] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [UQ__EntryTyp__3214EC061CFC5860] UNIQUE NONCLUSTERED ([Id] ASC)
);

