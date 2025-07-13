CREATE TABLE [medical].[ServiceDRGGroup] (
    [ServiceDRGGroupId]      INT          IDENTITY (1, 1) NOT NULL,
    [ServiceId]              INT          NOT NULL,
    [ICD10DiagnosticGroupId] INT          NULL,
    [IsActive]               BIT          NOT NULL,
    [IsDeleted]              BIT          NOT NULL,
    [CreatedBy]              VARCHAR (50) NOT NULL,
    [CreatedDate]            DATETIME     NOT NULL,
    [ModifiedBy]             VARCHAR (50) NOT NULL,
    [ModifiedDate]           DATETIME     NOT NULL,
    CONSTRAINT [PK_medical_ServiceDRGGroup_Temp_ServiceDRGGroupId] PRIMARY KEY CLUSTERED ([ServiceDRGGroupId] ASC) WITH (FILLFACTOR = 95),
    CONSTRAINT [FK_medical_ServiceDRGGroup_ICD10DiagnosticGroupId] FOREIGN KEY ([ICD10DiagnosticGroupId]) REFERENCES [medical].[ICD10DiagnosticGroup] ([ICD10DiagnosticGroupId])
);

