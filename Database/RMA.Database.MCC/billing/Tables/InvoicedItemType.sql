CREATE TABLE [billing].[InvoicedItemType] (
    [InvoicedItemTypeId] INT            IDENTITY (1, 1) NOT NULL,
    [Name]               VARCHAR (100)  NOT NULL,
    [Description]        VARCHAR (1000) NULL,
    CONSTRAINT [PK_InvoicedItemType] PRIMARY KEY CLUSTERED ([InvoicedItemTypeId] ASC)
);

