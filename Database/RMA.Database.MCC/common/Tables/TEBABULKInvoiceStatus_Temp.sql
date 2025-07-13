CREATE TABLE [common].[TEBABULKInvoiceStatus_Temp] (
    [TEBABULKInvoiceStatusId] INT            IDENTITY (1, 1) NOT NULL,
    [Name]                    VARCHAR (50)   NOT NULL,
    [Description]             VARCHAR (2048) NULL,
    [IsActive]                BIT            NOT NULL,
    [IsDeleted]               BIT            NOT NULL,
    [CreatedBy]               VARCHAR (50)   NOT NULL,
    [CreatedDate]             DATETIME       NOT NULL,
    [ModifiedBy]              VARCHAR (50)   NOT NULL,
    [ModifiedDate]            DATETIME       NOT NULL,
    CONSTRAINT [PK_Common_TEBABULKInvoiceStatus_Temp_TEBABULKInvoiceStatusId] PRIMARY KEY CLUSTERED ([TEBABULKInvoiceStatusId] ASC) WITH (FILLFACTOR = 95)
);

