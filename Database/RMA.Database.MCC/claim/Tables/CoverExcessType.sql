CREATE TABLE [claim].[CoverExcessType] (
    [CoverExcessTypeId] INT            IDENTITY (1, 1) NOT NULL,
    [Name]              VARCHAR (50)   NOT NULL,
    [Description]       VARCHAR (2048) NULL,
    [CreatedBy]         VARCHAR (50)   NOT NULL,
    [CreatedDate]       DATETIME       NOT NULL,
    [ModifiedBy]        VARCHAR (50)   NOT NULL,
    [ModifiedDate]      DATETIME       NOT NULL,
    CONSTRAINT [PK_CoverExcessType] PRIMARY KEY CLUSTERED ([CoverExcessTypeId] ASC)
);

