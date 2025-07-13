CREATE TABLE [commission].[ClawedBackComm] (
    [CommissionID]          INT   NOT NULL,
    [CommCalcDate]          DATE  NOT NULL,
    [ClawBackCalcDate]      DATE  NOT NULL,
    [OriginalCommissionDue] MONEY NOT NULL,
    [RetentionBalance]      MONEY NOT NULL,
    [ClawBackAmount]        MONEY NOT NULL,
    [RetentionOffset]       MONEY NOT NULL,
    [NewRetentionBalance]   MONEY NOT NULL,
    [RetentionRelease]      MONEY NOT NULL,
    [NetClawback]           MONEY NOT NULL,
    PRIMARY KEY CLUSTERED ([CommissionID] ASC, [CommCalcDate] ASC)
);


GO
CREATE NONCLUSTERED INDEX [IDX_ClawedBackComm_CommissionID]
    ON [commission].[ClawedBackComm]([CommissionID] ASC);

