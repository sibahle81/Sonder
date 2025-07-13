CREATE TABLE [medical].[TebaAuthBreakdown_Temp] (
    [TebaAuthBreakDownId] INT          IDENTITY (1, 1) NOT NULL,
    [TebaAuthID]          INT          NOT NULL,
    [RateTypeID]          INT          NULL,
    [Rate]                DECIMAL (18) NULL,
    [AuthorisedRate]      DECIMAL (18) NULL,
    [AuthorisedQty]       DECIMAL (18) NULL,
    [AuthorisedAmount]    DECIMAL (18) NULL,
    CONSTRAINT [PK_TebaAuthBreakdown] PRIMARY KEY CLUSTERED ([TebaAuthBreakDownId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_TebaAuthBreakdown_Temp_TebaAuthorisation_Temp] FOREIGN KEY ([TebaAuthID]) REFERENCES [medical].[TebaAuthorisation_Temp] ([TebaAuthID])
);

