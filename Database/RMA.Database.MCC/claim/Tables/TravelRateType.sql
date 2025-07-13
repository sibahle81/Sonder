CREATE TABLE [claim].[TravelRateType] (
    [TravelRateTypeId] INT            IDENTITY (1, 1) NOT NULL,
    [Name]             VARCHAR (50)   NOT NULL,
    [Description]      VARCHAR (2048) NULL,
    [IsDeleted]        BIT            NOT NULL,
    [CreatedBy]        VARCHAR (50)   NOT NULL,
    [CreatedDate]      DATETIME       NOT NULL,
    [ModifiedBy]       VARCHAR (50)   NOT NULL,
    [ModifiedDate]     DATETIME       NOT NULL,
    CONSTRAINT [PK_TravelRateType] PRIMARY KEY CLUSTERED ([TravelRateTypeId] ASC)
);

