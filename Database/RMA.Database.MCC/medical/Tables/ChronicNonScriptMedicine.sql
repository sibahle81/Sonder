CREATE TABLE [medical].[ChronicNonScriptMedicine] (
    [ChronicNonScriptMedicineId] INT          IDENTITY (1, 1) NOT NULL,
    [ChronicMedicationFormId]    INT          NOT NULL,
    [Description]                VARCHAR (50) NULL,
    [IsActive]                   BIT          DEFAULT ((1)) NOT NULL,
    [IsDeleted]                  BIT          DEFAULT ((0)) NOT NULL,
    [CreatedBy]                  VARCHAR (50) NOT NULL,
    [CreatedDate]                DATETIME     DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]                 VARCHAR (50) NOT NULL,
    [ModifiedDate]               DATETIME     NOT NULL,
    CONSTRAINT [PK_ChronicNonScriptMedicine] PRIMARY KEY CLUSTERED ([ChronicNonScriptMedicineId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_Medical_ChronicNonScriptMedicine_ChronicMedicationForm] FOREIGN KEY ([ChronicMedicationFormId]) REFERENCES [medical].[ChronicMedicationForm_Temp] ([ChronicMedicationFormId])
);

