CREATE TABLE [medical].[DOIMR_Temp] (
    [DOIMRID]          INT          IDENTITY (1, 1) NOT NULL,
    [DaysOffInvoiceID] INT          NOT NULL,
    [MedicalReportID]  INT          NOT NULL,
    [StartDate]        DATETIME     NOT NULL,
    [EndDate]          DATETIME     NOT NULL,
    [LastChangedBy]    VARCHAR (30) NOT NULL,
    [LastChangedDate]  DATETIME     NOT NULL,
    [IsActive]         BIT          NOT NULL,
    [IsDeleted]        BIT          NOT NULL,
    [CreatedBy]        VARCHAR (50) NOT NULL,
    [CreatedDate]      DATETIME     NOT NULL,
    [ModifiedBy]       VARCHAR (50) NOT NULL,
    [ModifiedDate]     DATETIME     NOT NULL,
    CONSTRAINT [PK_Compensation_DOIMR_DOIMRID] PRIMARY KEY CLUSTERED ([DOIMRID] ASC) WITH (FILLFACTOR = 95),
    CONSTRAINT [FK_Medical_DOIMR_DaysOffInvoiceID] FOREIGN KEY ([DaysOffInvoiceID]) REFERENCES [claim].[DaysOffInvoice] ([ClaimInvoiceId]),
    CONSTRAINT [FK_Medical_DOIMR_MedicalReportID] FOREIGN KEY ([MedicalReportID]) REFERENCES [medical].[MedicalReport_Temp] ([MedicalReportID])
);

