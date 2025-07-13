CREATE TABLE [pension].[CorrectiveEntrySplit] (
    [CorrectiveEntrySplitId] INT                                        IDENTITY (1, 1) NOT NULL,
    [Amount]                 MONEY MASKED WITH (FUNCTION = 'default()') NOT NULL,
    [PAYEAmount]             MONEY MASKED WITH (FUNCTION = 'default()') NULL,
    [CorrectiveEntryId]      INT                                        NOT NULL,
    [StartDate]              DATETIME                                   NULL,
    [EndDate]                DATETIME                                   NULL,
    [DayMonthCount]          INT                                        NULL,
    [IsActive]               BIT                                        NOT NULL,
    [IsDeleted]              BIT                                        NOT NULL,
    [CreatedBy]              VARCHAR (50)                               NOT NULL,
    [CreatedDate]            DATETIME                                   NOT NULL,
    [ModifiedBy]             VARCHAR (50)                               NOT NULL,
    [ModifiedDate]           DATETIME                                   NOT NULL,
    PRIMARY KEY CLUSTERED ([CorrectiveEntrySplitId] ASC),
    CONSTRAINT [FK_CorrectiveEntrySplit_CorrectiveEntry] FOREIGN KEY ([CorrectiveEntryId]) REFERENCES [pension].[CorrectiveEntry] ([CorrectiveEntryId])
);

