CREATE TABLE [medical].[ProstheticItem] (
    [ProstheticItemId]           INT            IDENTITY (1, 1) NOT NULL,
    [RegionGroupId]              INT            NULL,
    [ProstheticItemCategoryId]   INT            NULL,
    [ItemCode]                   VARCHAR (50)   NULL,
    [NoOfUnits]                  SMALLINT       NULL,
    [ReplacementPeriodFromMnths] SMALLINT       NULL,
    [ReplacementPeriodToMnths]   SMALLINT       NULL,
    [Notes]                      VARCHAR (2048) NULL,
    [IsSupplierGurantee]         TINYINT        NULL,
    [SupGuranteePeriodMnths]     SMALLINT       NULL,
    [Narration]                  VARCHAR (1024) NULL,
    [IsActive]                   BIT            NOT NULL,
    [IsDeleted]                  BIT            NOT NULL,
    [CreatedBy]                  VARCHAR (50)   NOT NULL,
    [CreatedDate]                DATETIME       NOT NULL,
    [ModifiedBy]                 VARCHAR (50)   NOT NULL,
    [ModifiedDate]               DATETIME       NOT NULL,
    CONSTRAINT [PK_ProstheticItem_Temp] PRIMARY KEY CLUSTERED ([ProstheticItemId] ASC) WITH (FILLFACTOR = 95)
);

