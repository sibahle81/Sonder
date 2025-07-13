CREATE TABLE [medical].[MedicalReportAcknowledge_Temp] (
    [MedicalReportAcknowledgeID] INT           IDENTITY (1, 1) NOT NULL,
    [MedicalReportID]            INT           NOT NULL,
    [AcknowledgedDate]           DATETIME      NULL,
    [AcknowledgedBy]             VARCHAR (20)  NULL,
    [ICD10VerifiedDate]          DATETIME      NULL,
    [ICD10VerifiedBy]            VARCHAR (20)  NULL,
    [RejectionReason]            VARCHAR (250) NULL,
    [RejectedBy]                 VARCHAR (50)  NULL,
    [RejectedDate]               DATETIME      NULL,
    [IsActive]                   BIT           NOT NULL,
    [IsDeleted]                  BIT           NOT NULL,
    [CreatedBy]                  VARCHAR (50)  NOT NULL,
    [CreatedDate]                DATETIME      NOT NULL,
    [ModifiedBy]                 VARCHAR (50)  NOT NULL,
    [ModifiedDate]               DATETIME      NOT NULL,
    CONSTRAINT [PK_Medical.MedicalReportAcknowledge] PRIMARY KEY CLUSTERED ([MedicalReportAcknowledgeID] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_MedicalReportAcknowledge_MedicalReport_MedicalReportID] FOREIGN KEY ([MedicalReportID]) REFERENCES [claim].[MedicalReport] ([MedicalReportId]),
    UNIQUE NONCLUSTERED ([MedicalReportID] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    UNIQUE NONCLUSTERED ([MedicalReportID] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON)
);

