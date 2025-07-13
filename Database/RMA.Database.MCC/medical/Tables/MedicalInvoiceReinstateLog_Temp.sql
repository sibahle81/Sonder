CREATE TABLE [medical].[MedicalInvoiceReinstateLog_Temp] (
    [MedicalInvoiceReinstateLogId] INT           IDENTITY (1, 1) NOT NULL,
    [MedicalInvoiceId]             INT           NOT NULL,
    [UnderAssessReasonIDBefore]    INT           NOT NULL,
    [UnderAssessReasonIDAfter]     INT           NULL,
    [InvoiceStatusIdBefore]        INT           NOT NULL,
    [InvoiceStatusIdAfter]         INT           NULL,
    [ResourceKey]                  VARCHAR (20)  NULL,
    [PractionerType]               VARCHAR (50)  NULL,
    [MoreInfo]                     VARCHAR (250) NULL,
    [IsActive]                     BIT           NULL,
    [IsDeleted]                    BIT           NOT NULL,
    [CreatedBy]                    VARCHAR (50)  NOT NULL,
    [CreatedDate]                  DATETIME      NOT NULL,
    [ModifiedBy]                   VARCHAR (50)  NOT NULL,
    [ModifiedDate]                 DATETIME      NOT NULL,
    CONSTRAINT [PK_medical_MedicalInvoiceReinstateLog_Temp_MedicalInvoiceReinstateLogId] PRIMARY KEY CLUSTERED ([MedicalInvoiceReinstateLogId] ASC) WITH (FILLFACTOR = 95)
);

