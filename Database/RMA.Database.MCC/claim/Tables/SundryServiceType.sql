CREATE TABLE [claim].[SundryServiceType] (
    [SundryServiceTypeId] INT           NOT NULL,
    [Name]                VARCHAR (255) NOT NULL,
    [Description]         VARCHAR (255) NOT NULL,
    [IsDeleted]           BIT           NOT NULL,
    [CreatedBy]           VARCHAR (50)  NOT NULL,
    [CreatedDate]         DATETIME      NOT NULL,
    [ModifiedBy]          VARCHAR (50)  NOT NULL,
    [ModifiedDate]        DATETIME      NOT NULL,
    CONSTRAINT [PK__SundryServiceType] PRIMARY KEY CLUSTERED ([SundryServiceTypeId] ASC)
);

