CREATE TABLE [medical].[Modifier] (
    [Id]           INT            NOT NULL,
    [Code]         VARCHAR (20)   NULL,
    [Description]  VARCHAR (2048) NULL,
    [IsActive]     BIT            NOT NULL,
    [IsDeleted]    BIT            NOT NULL,
    [CreatedBy]    VARCHAR (50)   NOT NULL,
    [CreatedDate]  DATETIME       NOT NULL,
    [ModifiedBy]   VARCHAR (50)   NOT NULL,
    [ModifiedDate] DATETIME       NOT NULL,
    CONSTRAINT [PK_Modifier] PRIMARY KEY CLUSTERED ([Id] ASC) WITH (FILLFACTOR = 95)
);

