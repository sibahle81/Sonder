CREATE TABLE [commission].[PolicyCommission] (
    [id]                    INT             IDENTITY (1, 1) NOT NULL,
    [CommBatchID]           INT             NOT NULL,
    [PolicyNumber]          VARCHAR (18)    NOT NULL,
    [CommTypeID]            INT             NOT NULL,
    [CommReason]            VARCHAR (30)    NULL,
    [CommissionablePremium] DECIMAL (14, 2) NULL,
    [CommDue]               DECIMAL (14, 2) NULL,
    [CommRetention]         DECIMAL (14, 2) NULL,
    [CalcDate]              DATE            NOT NULL,
    [Paydate]               DATE            NULL,
    [PolicyInceptionDate]   DATE            NULL,
    [PolicyCancelDate]      DATE            NULL,
    [PolicyCaptureDate]     DATE            NULL,
    [CommStatus]            VARCHAR (25)    NOT NULL,
    [PaymentBatch]          INT             NULL,
    PRIMARY KEY CLUSTERED ([id] ASC)
);


GO
CREATE NONCLUSTERED INDEX [IDX_PolicyCommission_CommTypeID]
    ON [commission].[PolicyCommission]([CommTypeID] ASC);


GO
CREATE NONCLUSTERED INDEX [IDX_PolicyCommission_PolicyNumber]
    ON [commission].[PolicyCommission]([PolicyNumber] ASC);

