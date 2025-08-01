﻿CREATE TABLE [medical].[InvoiceLine_POPI] (
    [InvoiceLineId]              INT              IDENTITY (1, 1) NOT NULL,
    [InvoiceId]                  INT              NOT NULL,
    [ServiceDate]                DATETIME         NOT NULL,
    [RequestedQuantity]          DECIMAL (7, 2)   NULL,
    [AuthorisedQuantity]         DECIMAL (7, 2)   NOT NULL,
    [RequestedAmount]            DECIMAL (18, 2)  NOT NULL,
    [RequestedVAT]               DECIMAL (18, 2)  NOT NULL,
    [RequestedAmountInclusive]   DECIMAL (19, 2)  NULL,
    [AuthorisedAmount]           DECIMAL (18, 2)  NULL,
    [AuthorisedVAT]              DECIMAL (18, 2)  NULL,
    [AuthorisedAmountInclusive]  DECIMAL (19, 2)  NULL,
    [TotalTariffAmount]          DECIMAL (18, 2)  NOT NULL,
    [TotalTariffVAT]             DECIMAL (18, 2)  NOT NULL,
    [TotalTariffAmountInclusive] DECIMAL (19, 2)  NULL,
    [TariffAmount]               DECIMAL (30, 10) NULL,
    [CreditAmount]               DECIMAL (18, 2)  NOT NULL,
    [VatCodeId]                  INT              NOT NULL,
    [VATPercentage]              DECIMAL (7, 2)   NULL,
    [TariffId]                   INT              NOT NULL,
    [TreatmentCodeId]            INT              NOT NULL,
    [MedicalItemId]              INT              NOT NULL,
    [HCPTariffCode]              VARCHAR (12)     NULL,
    [TariffBaseUnitCostTypeId]   INT              NULL,
    [Description]                VARCHAR (2048)   NULL,
    [SummaryInvoiceLineId]       INT              NULL,
    [IsPerDiemCharge]            BIT              NOT NULL,
    [IsDuplicate]                BIT              NOT NULL,
    [DuplicateInvoiceLineId]     INT              NOT NULL,
    [CalculateOperands]          VARCHAR (2048)   NULL,
    [ICD10Code]                  VARCHAR (255)    NULL,
    [IsActive]                   BIT              NOT NULL,
    [IsDeleted]                  BIT              NOT NULL,
    [CreatedBy]                  VARCHAR (50)     NOT NULL,
    [CreatedDate]                DATETIME         NOT NULL,
    [ModifiedBy]                 VARCHAR (50)     NOT NULL,
    [ModifiedDate]               DATETIME         NOT NULL
);

