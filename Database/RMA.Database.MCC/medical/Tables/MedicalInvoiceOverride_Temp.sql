CREATE TABLE [medical].[MedicalInvoiceOverride_Temp] (
    [OverrideId]          BIGINT       IDENTITY (1, 1) NOT NULL,
    [MedicalInvoiceId]    INT          NOT NULL,
    [UnderAssessReasonId] INT          NOT NULL,
    [IsActive]            BIT          NULL,
    [IsDeleted]           BIT          NOT NULL,
    [CreatedBy]           VARCHAR (50) NOT NULL,
    [CreatedDate]         DATETIME     NOT NULL,
    [ModifiedBy]          VARCHAR (50) NOT NULL,
    [ModifiedDate]        DATETIME     NOT NULL,
    CONSTRAINT [PK_medical_MedicalInvoiceOverride_Temp_OverrideId] PRIMARY KEY CLUSTERED ([OverrideId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_medical_MedicalInvoiceOverride_Temp_MedicalInvoiceId] FOREIGN KEY ([MedicalInvoiceId]) REFERENCES [medical].[Invoice] ([InvoiceId]),
    CONSTRAINT [FK_medical_MedicalInvoiceOverride_Temp_UnderAssessReasonId] FOREIGN KEY ([UnderAssessReasonId]) REFERENCES [common].[UnderAssessReason] ([UnderAssessReasonId])
);

