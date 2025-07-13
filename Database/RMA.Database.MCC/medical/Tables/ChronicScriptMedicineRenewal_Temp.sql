CREATE TABLE [medical].[ChronicScriptMedicineRenewal_Temp] (
    [ChronicScriptMedicineRenewalId] INT           IDENTITY (1, 1) NOT NULL,
    [ChronicMedicationFormRenewalId] INT           NOT NULL,
    [Description]                    VARCHAR (100) NOT NULL,
    [ICD10CodeId]                    INT           NULL,
    [MedicinePrescribed]             VARCHAR (100) NULL,
    [Dosage]                         VARCHAR (50)  NULL,
    [IsActive]                       BIT           NOT NULL,
    [ICD10Code]                      VARCHAR (50)  NULL,
    [NumberOfRepeats]                TINYINT       NULL,
    [IsDeleted]                      BIT           NOT NULL,
    [CreatedBy]                      VARCHAR (50)  NOT NULL,
    [CreatedDate]                    DATETIME      NOT NULL,
    [ModifiedBy]                     VARCHAR (50)  NOT NULL,
    [ModifiedDate]                   DATETIME      NOT NULL,
    CONSTRAINT [PK_ChronicScriptMedicineRenewal_Temp] PRIMARY KEY CLUSTERED ([ChronicScriptMedicineRenewalId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_Medical_ChronicScriptMedicineRenewal_Temp_ChronicMedicationFormRenewal_Temp] FOREIGN KEY ([ChronicMedicationFormRenewalId]) REFERENCES [medical].[ChronicMedicationFormRenewal_Temp] ([ChronicMedicationFormRenewalId])
);

