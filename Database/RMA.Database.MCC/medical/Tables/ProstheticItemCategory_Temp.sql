CREATE TABLE [medical].[ProstheticItemCategory_Temp] (
    [ProstheticItemCategoryID] INT            IDENTITY (1, 1) NOT NULL,
    [Name]                     VARCHAR (50)   NOT NULL,
    [Description]              VARCHAR (2048) NOT NULL,
    [IsActive]                 BIT            NOT NULL,
    [IsDeleted]                BIT            NOT NULL,
    [CreatedBy]                VARCHAR (50)   NOT NULL,
    [CreatedDate]              DATETIME       NOT NULL,
    [ModifiedBy]               VARCHAR (50)   NOT NULL,
    [ModifiedDate]             DATETIME       NOT NULL
);

