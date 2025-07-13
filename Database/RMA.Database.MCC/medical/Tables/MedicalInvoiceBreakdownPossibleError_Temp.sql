CREATE TABLE [medical].[MedicalInvoiceBreakdownPossibleError_Temp] (
    [MedicalInvoiceBreakdownId]   INT           NOT NULL,
    [PossibleUnderAssessReasonId] INT           NOT NULL,
    [ErrorDescription]            VARCHAR (250) NULL,
    [IsActive]                    BIT           NULL,
    [IsDeleted]                   BIT           NOT NULL,
    [CreatedBy]                   VARCHAR (50)  NOT NULL,
    [CreatedDate]                 DATETIME      NOT NULL,
    [ModifiedBy]                  VARCHAR (50)  NOT NULL,
    [ModifiedDate]                DATETIME      NOT NULL
);

