CREATE TABLE [debt].[CollectionStatusMaster] (
    [Id]                             INT            IDENTITY (1, 1) NOT NULL,
    [StatusCategoryName]             VARCHAR (200)  NOT NULL,
    [DebtCollectionStatusCodeId]     INT            NOT NULL,
    [DebtCollectionStatusCategoryId] INT            NOT NULL,
    [LogText]                        VARCHAR (1000) NOT NULL,
    [IsActive]                       BIT            DEFAULT ((1)) NOT NULL,
    [IsDeleted]                      BIT            NOT NULL,
    [CreatedBy]                      VARCHAR (100)  NOT NULL,
    [CreatedDate]                    DATETIME       NOT NULL,
    [ModifiedBy]                     VARCHAR (100)  NOT NULL,
    [ModifiedDate]                   DATETIME       NOT NULL,
    [TransferToDepartmentId]         INT            NULL,
    CONSTRAINT [PK_CollectionStatusMaster] PRIMARY KEY CLUSTERED ([Id] ASC)
);

