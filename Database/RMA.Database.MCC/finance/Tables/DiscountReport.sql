CREATE TABLE [finance].[DiscountReport] (
    [DebtorName]             VARCHAR (50)    NULL,
    [class]                  VARCHAR (50)    NULL,
    [DebtorCode]             VARCHAR (50)    NULL,
    [InvoiceDiscounted]      DECIMAL (18, 2) NULL,
    [AmountDiscounted]       DECIMAL (18, 2) NULL,
    [DiscountDateRequested]  DATETIME        NULL,
    [DiscountDateProcessed]  DATETIME        NULL,
    [DiscountReason]         VARCHAR (255)   NULL,
    [ClaimNumber]            VARCHAR (50)    NULL,
    [MedicalServiceProvider] VARCHAR (50)    NULL
);

