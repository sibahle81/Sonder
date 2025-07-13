CREATE TABLE [medical].[ChronicMedicationReceiptBreakdown_Temp] (
    [ChronicMedicationReceiptBreakdownId] INT            IDENTITY (1, 1) NOT NULL,
    [ChronicMedicationReceiptId]          INT            NOT NULL,
    [MedicalItemId]                       INT            NOT NULL,
    [Qty]                                 DECIMAL (7, 2) NOT NULL,
    [IsActive]                            BIT            NOT NULL,
    [IsDeleted]                           BIT            NOT NULL,
    [CreatedBy]                           VARCHAR (50)   NOT NULL,
    [CreatedDate]                         DATETIME       NOT NULL,
    [ModifiedBy]                          VARCHAR (50)   NOT NULL,
    [ModifiedDate]                        DATETIME       NOT NULL,
    CONSTRAINT [PK_ChronicMedicationReceiptBreakdown_Temp] PRIMARY KEY CLUSTERED ([ChronicMedicationReceiptBreakdownId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_Medical_ChronicMedicationReceiptBreakdown_Temp_ChronicMedicationReceipt_Temp] FOREIGN KEY ([ChronicMedicationReceiptId]) REFERENCES [medical].[ChronicMedicationReceipt_Temp] ([ChronicMedicationReceiptId])
);

