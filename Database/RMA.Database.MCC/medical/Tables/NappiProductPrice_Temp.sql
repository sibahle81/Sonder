CREATE TABLE [medical].[NappiProductPrice_Temp] (
    [NappiCode]          VARCHAR (50)    NOT NULL,
    [ProductPackSize]    DECIMAL (10, 2) NOT NULL,
    [RetailPrice]        MONEY           NULL,
    [ManufacturerCode]   VARCHAR (12)    NOT NULL,
    [ManufacturerName]   VARCHAR (50)    NULL,
    [PriceEffDate]       DATETIME        NOT NULL,
    [PriceTermDate]      DATETIME        NOT NULL,
    [PractitionerTypeId] INT             NULL,
    [VatCodeId]          INT             NULL,
    [TariffId]           INT             NULL,
    [NappiCodeSuffix]    CHAR (3)        NULL,
    [Schedule]           VARCHAR (12)    NULL,
    [IsActive]           BIT             DEFAULT ((1)) NOT NULL,
    [IsDeleted]          BIT             DEFAULT ((0)) NOT NULL,
    [CreatedBy]          VARCHAR (50)    NOT NULL,
    [CreatedDate]        DATETIME        DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]         VARCHAR (50)    NOT NULL,
    [ModifiedDate]       DATETIME        NOT NULL
);

