CREATE TABLE [commission].[PolicyImport] (
    [ImportBatch]                INT             NOT NULL,
    [rowid]                      BIGINT          IDENTITY (1, 1) NOT NULL,
    [BrokerName]                 VARCHAR (255)   NOT NULL,
    [BrokerRepID]                VARCHAR (50)    NOT NULL,
    [PolicyNumber]               VARCHAR (18)    NOT NULL,
    [ProductID]                  VARCHAR (35)    NOT NULL,
    [PolicyStatus]               VARCHAR (30)    NOT NULL,
    [PolicyCaptureDate]          DATE            NULL,
    [PolicyQADDDate]             DATE            NULL,
    [PolicyInceptionDate]        DATE            NOT NULL,
    [LifeID]                     VARCHAR (50)    NOT NULL,
    [MemberType]                 VARCHAR (35)    NOT NULL,
    [LifeDOB]                    DATE            NOT NULL,
    [LifeStatus]                 VARCHAR (15)    NULL,
    [BillingPremium]             DECIMAL (14, 2) NULL,
    [CommissionablePremium]      DECIMAL (14, 2) NULL,
    [CommissionablePremiumDelta] DECIMAL (14, 2) NULL,
    [AffordabilityStatus]        VARCHAR (30)    NOT NULL,
    [CollectionStatus]           VARCHAR (30)    NULL,
    [FirstCollectionMonth]       DATE            NULL,
    [importeddate]               DATETIME        NOT NULL,
    [CurrentRecord]              INT             NULL,
    [RecordVersion]              INT             NULL,
    [processed]                  INT             NULL,
    [AnnIncrType]                VARCHAR (60)    NULL,
    [parent]                     VARCHAR (1)     NULL,
    [CoverAmt]                   DECIMAL (14, 2) NULL,
    [PrevCoverAmt]               DECIMAL (14, 2) NULL,
    [statusdate]                 DATETIME        NULL,
    PRIMARY KEY CLUSTERED ([rowid] ASC)
);


GO
CREATE NONCLUSTERED INDEX [IDX_PolicyImport_PolicyNumber]
    ON [commission].[PolicyImport]([PolicyNumber] ASC, [CurrentRecord] ASC);

