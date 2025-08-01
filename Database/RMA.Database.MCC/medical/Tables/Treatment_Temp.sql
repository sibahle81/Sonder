﻿CREATE TABLE [medical].[Treatment_Temp] (
    [TreatmentID]           INT            IDENTITY (1, 1) NOT NULL,
    [Description]           VARCHAR (200)  NULL,
    [TreatmentCodeID]       INT            NOT NULL,
    [MedicalInvoiceID]      INT            NULL,
    [TreatmentAuthStatusID] INT            NOT NULL,
    [TreatmentStatusID]     INT            NOT NULL,
    [TreatmentAuthID]       INT            NULL,
    [DateAdmitted]          DATETIME       NOT NULL,
    [DateDischarged]        DATETIME       NOT NULL,
    [NumberTreatments]      DECIMAL (7, 2) NOT NULL,
    [InjuryID]              INT            NOT NULL,
    [IsChronic]             BIT            NOT NULL,
    [DateCaptured]          DATETIME       NOT NULL,
    [IsActive]              BIT            NOT NULL,
    [IsDeleted]             BIT            NOT NULL,
    [CreatedBy]             VARCHAR (50)   NOT NULL,
    [CreatedDate]           DATETIME       NOT NULL,
    [ModifiedBy]            VARCHAR (50)   NOT NULL,
    [ModifiedDate]          DATETIME       NOT NULL,
    CONSTRAINT [PK_Compensation_Treatment_TreatmentID] PRIMARY KEY CLUSTERED ([TreatmentID] ASC) WITH (FILLFACTOR = 95),
    CONSTRAINT [FK_Medical_Treatment_InjuryID] FOREIGN KEY ([InjuryID]) REFERENCES [claim].[Injury] ([InjuryId]),
    CONSTRAINT [FK_Medical_Treatment_MedicalInvoiceID] FOREIGN KEY ([MedicalInvoiceID]) REFERENCES [medical].[Invoice] ([InvoiceId]),
    CONSTRAINT [FK_Medical_Treatment_TreatmentAuthID] FOREIGN KEY ([TreatmentAuthID]) REFERENCES [medical].[TreatmentAuth_Temp] ([TreatmentAuthID]),
    CONSTRAINT [FK_Medical_Treatment_TreatmentCodeID] FOREIGN KEY ([TreatmentCodeID]) REFERENCES [medical].[TreatmentCode] ([TreatmentCodeId])
);

