CREATE TABLE [common].[CurrencyType_Temp] (
    [CurrencyTypeId] INT            IDENTITY (1000, 1) NOT NULL,
    [Name]           VARCHAR (50)   NOT NULL,
    [Description]    VARCHAR (2048) NULL,
    [IsActive]       BIT            NOT NULL,
    [IsDeleted]      BIT            NOT NULL,
    [CreatedBy]      VARCHAR (50)   NOT NULL,
    [CreatedDate]    DATETIME       NOT NULL,
    [ModifiedBy]     VARCHAR (50)   NOT NULL,
    [ModifiedDate]   DATETIME       NOT NULL,
    CONSTRAINT [PK_Common_CurrencyType_Temp_CurrencyTypeId] PRIMARY KEY CLUSTERED ([CurrencyTypeId] ASC) WITH (FILLFACTOR = 95)
);

