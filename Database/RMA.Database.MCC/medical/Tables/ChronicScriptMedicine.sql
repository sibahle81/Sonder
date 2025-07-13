CREATE TABLE [medical].[ChronicScriptMedicine] (
    [ChronicScriptMedicineId] INT           IDENTITY (1, 1) NOT NULL,
    [ChronicMedicationFormId] INT           NOT NULL,
    [Description]             VARCHAR (100) NOT NULL,
    [ICD10CodeId]             INT           NULL,
    [MedicinePrescribed]      VARCHAR (100) NULL,
    [Dosage]                  VARCHAR (50)  NULL,
    [IsPreExistOrChronic]     BIT           NOT NULL,
    [IsActive]                BIT           DEFAULT ((1)) NOT NULL,
    [ICD10Code]               VARCHAR (50)  NULL,
    [NumberOfRepeats]         TINYINT       NULL,
    [IsDeleted]               BIT           DEFAULT ((0)) NOT NULL,
    [CreatedBy]               VARCHAR (50)  NOT NULL,
    [CreatedDate]             DATETIME      DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]              VARCHAR (50)  NOT NULL,
    [ModifiedDate]            DATETIME      NOT NULL,
    CONSTRAINT [PK_ChronicScriptMedicine] PRIMARY KEY CLUSTERED ([ChronicScriptMedicineId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_Medical_ChronicScriptMedicine_ChronicMedicationForm] FOREIGN KEY ([ChronicMedicationFormId]) REFERENCES [medical].[ChronicMedicationForm] ([ChronicMedicationFormId])
);

