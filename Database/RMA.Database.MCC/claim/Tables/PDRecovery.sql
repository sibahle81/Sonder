CREATE TABLE [claim].[PDRecovery] (
    [PDRecoveryId]                INT             NOT NULL,
    [MedicalAssessmentId]         INT             NOT NULL,
    [FromPDAwardID]               INT             NOT NULL,
    [FromBeneficiaryPensionID]    INT             NULL,
    [AgainstBeneficiaryPensionID] INT             NULL,
    [PDRecoveryStatusID]          INT             NOT NULL,
    [OriginalAmount]              DECIMAL (10, 2) NOT NULL,
    [OriginalPDExtent]            DECIMAL (10, 2) NOT NULL,
    [RecoveryAmount]              DECIMAL (10, 2) NULL,
    [RecoveryMonthlyPension]      DECIMAL (10, 2) NULL,
    [CalcOperands]                VARCHAR (500)   NOT NULL,
    [DateRecovered]               DATETIME        NULL,
    [IsDeleted]                   BIT             NOT NULL,
    [CreatedBy]                   VARCHAR (50)    NOT NULL,
    [CreatedDate]                 DATETIME        NOT NULL,
    [ModifiedBy]                  VARCHAR (50)    NOT NULL,
    [ModifiedDate]                DATETIME        NOT NULL,
    CONSTRAINT [PK__PDRecovery] PRIMARY KEY CLUSTERED ([PDRecoveryId] ASC),
    CONSTRAINT [FK_PDRecovery_MedicalAssessment_Temp] FOREIGN KEY ([MedicalAssessmentId]) REFERENCES [medical].[MedicalAssessment_Temp] ([MedicalAssessmentID]),
    CONSTRAINT [FK_PDRecovery_PDAward] FOREIGN KEY ([FromPDAwardID]) REFERENCES [claim].[PDAward] ([PDAwardId]),
    CONSTRAINT [FK_PDRecovery_PDRecoveryStatus] FOREIGN KEY ([PDRecoveryStatusID]) REFERENCES [claim].[PDRecoveryStatus] ([PDRecoveryStatusId])
);

