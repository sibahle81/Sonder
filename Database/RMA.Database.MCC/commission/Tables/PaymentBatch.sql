CREATE TABLE [commission].[PaymentBatch] (
    [CommBatchID] INT   IDENTITY (1, 1) NOT NULL,
    [BatchDate]   DATE  NOT NULL,
    [Batchstatus] INT   NOT NULL,
    [BatchTotal]  MONEY NOT NULL,
    PRIMARY KEY CLUSTERED ([CommBatchID] ASC)
);

