CREATE TABLE [common].[DesignationType] (
    [DesignationTypeID] INT            IDENTITY (1, 1) NOT NULL,
    [Code]              NVARCHAR (50)  NULL,
    [Name]              NVARCHAR (255) NULL,
    [Description]       NVARCHAR (MAX) NULL,
    PRIMARY KEY CLUSTERED ([DesignationTypeID] ASC)
);

