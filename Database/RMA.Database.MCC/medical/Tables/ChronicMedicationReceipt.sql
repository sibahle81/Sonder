CREATE TABLE [medical].[ChronicMedicationReceipt] (
    [ChronicMedicationReceiptId] INT            IDENTITY (1, 1) NOT NULL,
    [ClaimId]                    INT            NOT NULL,
    [DateArrivedAtTEBA]          DATETIME       NULL,
    [DateCollected]              DATETIME       NULL,
    [Comments]                   VARCHAR (2048) NULL,
    [TEBAOfficial]               VARCHAR (50)   NULL,
    [CollectedBy]                VARCHAR (50)   NULL,
    [DateApproved]               DATETIME       NULL,
    [DisbursementTAC]            VARCHAR (50)   NULL,
    [IsActive]                   BIT            NOT NULL,
    [HasPensionerThumb]          BIT            NULL,
    [PreAuthId]                  INT            NULL,
    [HasPersonCollectingSign]    BIT            DEFAULT ((0)) NOT NULL,
    [HasPersonCollectingThumb]   BIT            DEFAULT ((0)) NOT NULL,
    [IsDeleted]                  BIT            NOT NULL,
    [CreatedBy]                  VARCHAR (50)   NOT NULL,
    [CreatedDate]                DATETIME       NOT NULL,
    [ModifiedBy]                 VARCHAR (50)   NOT NULL,
    [ModifiedDate]               DATETIME       NOT NULL,
    CONSTRAINT [PK_ChronicMedicationReceipt_Temp] PRIMARY KEY CLUSTERED ([ChronicMedicationReceiptId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON)
);

