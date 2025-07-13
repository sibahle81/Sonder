CREATE TABLE [claim].[Catastrophe] (
    [CatastropheId] INT           IDENTITY (1, 1) NOT NULL,
    [Name]          VARCHAR (50)  NOT NULL,
    [Description]   VARCHAR (100) NOT NULL,
    [CreatedBy]     VARCHAR (50)  NOT NULL,
    [CreatedDate]   DATETIME      NOT NULL,
    [ModifiedBy]    VARCHAR (50)  NOT NULL,
    [ModifiedDate]  DATETIME      NOT NULL,
    CONSTRAINT [PK_Catastrophe] PRIMARY KEY CLUSTERED ([CatastropheId] ASC)
);

