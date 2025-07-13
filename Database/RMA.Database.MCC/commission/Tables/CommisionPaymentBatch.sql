CREATE TABLE [commission].[CommisionPaymentBatch] (
    [ID]              INT   IDENTITY (1, 1) NOT NULL,
    [BatchCreateDate] DATE  NOT NULL,
    [BatchStatus]     INT   NOT NULL,
    [BrokerID]        INT   NOT NULL,
    [PolicyCount]     INT   NOT NULL,
    [BatchTotal]      MONEY NOT NULL,
    PRIMARY KEY CLUSTERED ([ID] ASC)
);

