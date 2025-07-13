CREATE TABLE [medical].[ChronicMedicalHistory] (
    [ChronicMedicalHistoryId] INT           IDENTITY (1, 1) NOT NULL,
    [ChronicMedicationFormId] INT           NOT NULL,
    [Disease]                 VARCHAR (100) NOT NULL,
    [DateDiagnosed]           DATETIME      NULL,
    [Treatment]               VARCHAR (200) NULL,
    [IsActive]                BIT           DEFAULT ((1)) NOT NULL,
    [ICD10Code]               VARCHAR (50)  NULL,
    [ICD10CodeId]             INT           NULL,
    [IsDeleted]               BIT           DEFAULT ((0)) NOT NULL,
    [CreatedBy]               VARCHAR (50)  NOT NULL,
    [CreatedDate]             DATETIME      DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]              VARCHAR (50)  NOT NULL,
    [ModifiedDate]            DATETIME      NOT NULL,
    CONSTRAINT [PK_ChronicMedicalHistory] PRIMARY KEY CLUSTERED ([ChronicMedicalHistoryId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_Medical_ChronicMedicalHistory_ChronicMedicalForm] FOREIGN KEY ([ChronicMedicationFormId]) REFERENCES [medical].[ChronicMedicationForm] ([ChronicMedicationFormId])
);

