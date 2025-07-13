CREATE TABLE [medical].[InvoiceLine] (
    [InvoiceLineId]              INT             IDENTITY (1, 1) NOT NULL,
    [InvoiceId]                  INT             NOT NULL,
    [ServiceDate]                DATETIME        NOT NULL,
    [ServiceTimeStart]           TIME (0)        NULL,
    [ServiceTimeEnd]             TIME (0)        NULL,
    [RequestedQuantity]          DECIMAL (7, 2)  NULL,
    [AuthorisedQuantity]         DECIMAL (7, 2)  NOT NULL,
    [RequestedAmount]            DECIMAL (18, 2) NOT NULL,
    [RequestedVAT]               DECIMAL (18, 2) NOT NULL,
    [RequestedAmountInclusive]   AS              (isnull([RequestedAmount],(0))+isnull([RequestedVat],(0))),
    [AuthorisedAmount]           DECIMAL (18, 2) NULL,
    [AuthorisedVAT]              DECIMAL (18, 2) NULL,
    [AuthorisedAmountInclusive]  AS              (isnull([AuthorisedAmount],(0))+isnull([AuthorisedVAT],(0))),
    [TotalTariffAmount]          DECIMAL (18, 2) NOT NULL,
    [TotalTariffVAT]             DECIMAL (18, 2) NOT NULL,
    [TotalTariffAmountInclusive] AS              ([TotalTariffAmount]+[TotalTariffVAT]),
    [TariffAmount]               AS              (((isnull([TotalTariffAmount],(0))+isnull([CreditAmount],(0)))+isnull([TotalTariffVat],(0)))/case when [AuthorisedQuantity]=(0) then (1) else [AuthorisedQuantity] end),
    [CreditAmount]               DECIMAL (18, 2) NOT NULL,
    [VatCodeId]                  INT             NOT NULL,
    [VATPercentage]              DECIMAL (7, 2)  NULL,
    [TariffId]                   INT             NOT NULL,
    [TreatmentCodeId]            INT             NOT NULL,
    [MedicalItemId]              INT             NOT NULL,
    [HCPTariffCode]              VARCHAR (12)    NULL,
    [TariffBaseUnitCostTypeId]   INT             NULL,
    [Description]                VARCHAR (2048)  NULL,
    [SummaryInvoiceLineId]       INT             NULL,
    [IsPerDiemCharge]            BIT             NOT NULL,
    [IsDuplicate]                BIT             NOT NULL,
    [DuplicateInvoiceLineId]     INT             NOT NULL,
    [CalculateOperands]          VARCHAR (2048)  NULL,
    [ICD10Code]                  VARCHAR (255)   NULL,
    [IsActive]                   BIT             CONSTRAINT [DF__InvoiceLi__IsAct__5478F159] DEFAULT ((1)) NOT NULL,
    [IsDeleted]                  BIT             CONSTRAINT [DF__InvoiceLi__IsDel__556D1592] DEFAULT ((0)) NOT NULL,
    [CreatedBy]                  VARCHAR (50)    NOT NULL,
    [CreatedDate]                DATETIME        CONSTRAINT [DF__InvoiceLi__Creat__566139CB] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]                 VARCHAR (50)    NOT NULL,
    [ModifiedDate]               DATETIME        NOT NULL,
    [IsModifier]                 BIT             NULL,
    CONSTRAINT [PK_Medical_InvoiceLineId] PRIMARY KEY CLUSTERED ([InvoiceLineId] ASC) WITH (FILLFACTOR = 95),
    CONSTRAINT [FK_Invoice_InvoiceLine_InvoiceId] FOREIGN KEY ([InvoiceId]) REFERENCES [medical].[Invoice] ([InvoiceId]) ON DELETE CASCADE
);








GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'VATPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'VATPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'VATPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'VATPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'VATPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'VATPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'VatCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'VatCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'VatCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'VatCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'VatCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'VatCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TreatmentCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TreatmentCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TreatmentCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TreatmentCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TreatmentCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TreatmentCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TotalTariffVAT';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TotalTariffVAT';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TotalTariffVAT';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TotalTariffVAT';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TotalTariffVAT';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TotalTariffVAT';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TotalTariffAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TotalTariffAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TotalTariffAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TotalTariffAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TotalTariffAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TotalTariffAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TariffId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TariffId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TariffId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TariffId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TariffId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TariffId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TariffBaseUnitCostTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TariffBaseUnitCostTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TariffBaseUnitCostTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TariffBaseUnitCostTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TariffBaseUnitCostTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TariffBaseUnitCostTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'SummaryInvoiceLineId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'SummaryInvoiceLineId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'SummaryInvoiceLineId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'SummaryInvoiceLineId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'SummaryInvoiceLineId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'SummaryInvoiceLineId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'ServiceDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'ServiceDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'ServiceDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'ServiceDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'ServiceDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'ServiceDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'RequestedVAT';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'RequestedVAT';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'RequestedVAT';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'RequestedVAT';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'RequestedVAT';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'RequestedVAT';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'RequestedQuantity';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'RequestedQuantity';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'RequestedQuantity';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'RequestedQuantity';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'RequestedQuantity';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'RequestedQuantity';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'RequestedAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'RequestedAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'RequestedAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'RequestedAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'RequestedAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'RequestedAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'MedicalItemId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'MedicalItemId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'MedicalItemId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'MedicalItemId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'MedicalItemId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'MedicalItemId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'IsPerDiemCharge';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'IsPerDiemCharge';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'IsPerDiemCharge';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'IsPerDiemCharge';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'IsPerDiemCharge';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'IsPerDiemCharge';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'IsDuplicate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'IsDuplicate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'IsDuplicate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'IsDuplicate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'IsDuplicate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'IsDuplicate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'InvoiceLineId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'InvoiceLineId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'InvoiceLineId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'InvoiceLineId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'InvoiceLineId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'InvoiceLineId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'InvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'InvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'InvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'InvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'InvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'InvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'ICD10Code';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'ICD10Code';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'ICD10Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'ICD10Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'ICD10Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'ICD10Code';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'HCPTariffCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'HCPTariffCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'HCPTariffCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'HCPTariffCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'HCPTariffCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'HCPTariffCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'DuplicateInvoiceLineId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'DuplicateInvoiceLineId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'DuplicateInvoiceLineId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'DuplicateInvoiceLineId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'DuplicateInvoiceLineId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'DuplicateInvoiceLineId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'CreditAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'CreditAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'CreditAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'CreditAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'CreditAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'CreditAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'CalculateOperands';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'CalculateOperands';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'CalculateOperands';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'CalculateOperands';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'CalculateOperands';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'CalculateOperands';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'AuthorisedVAT';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'AuthorisedVAT';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'AuthorisedVAT';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'AuthorisedVAT';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'AuthorisedVAT';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'AuthorisedVAT';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'AuthorisedQuantity';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'AuthorisedQuantity';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'AuthorisedQuantity';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'AuthorisedQuantity';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'AuthorisedQuantity';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'AuthorisedQuantity';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'AuthorisedAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'AuthorisedAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'AuthorisedAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'AuthorisedAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'AuthorisedAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'AuthorisedAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TotalTariffAmountInclusive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TotalTariffAmountInclusive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TotalTariffAmountInclusive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TotalTariffAmountInclusive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TotalTariffAmountInclusive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TotalTariffAmountInclusive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TariffAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TariffAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TariffAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TariffAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TariffAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'TariffAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'RequestedAmountInclusive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'RequestedAmountInclusive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'RequestedAmountInclusive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'RequestedAmountInclusive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'RequestedAmountInclusive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'RequestedAmountInclusive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'AuthorisedAmountInclusive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'AuthorisedAmountInclusive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'AuthorisedAmountInclusive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'AuthorisedAmountInclusive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'AuthorisedAmountInclusive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'InvoiceLine', @level2type = N'COLUMN', @level2name = N'AuthorisedAmountInclusive';

