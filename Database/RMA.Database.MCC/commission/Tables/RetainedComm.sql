CREATE TABLE [commission].[RetainedComm] (
    [ID]                 INT   IDENTITY (1, 1) NOT NULL,
    [CommissionID]       INT   NOT NULL,
    [CommCalcDate]       DATE  NOT NULL,
    [RetReleaseCalcDate] DATE  NOT NULL,
    [ORIGINALRETENTION]  MONEY NOT NULL,
    [ReleasedRetention]  MONEY NOT NULL,
    [RetentionBalance]   MONEY NOT NULL,
    PRIMARY KEY CLUSTERED ([ID] ASC)
);


GO
CREATE NONCLUSTERED INDEX [IDX_RetainedComm_CommissionID]
    ON [commission].[RetainedComm]([CommissionID] ASC);

