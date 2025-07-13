CREATE TABLE [common].[OccupationType] (
    [OccupationTypeID] INT            IDENTITY (1, 1) NOT NULL,
    [Code]             VARCHAR (12)   NULL,
    [Name]             VARCHAR (50)   NULL,
    [Description]      VARCHAR (2048) NULL,
    [IsDeleted]        BIT            DEFAULT ((0)) NOT NULL,
    [CreatedBy]        VARCHAR (50)   NOT NULL,
    [CreatedDate]      DATETIME       DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]       VARCHAR (50)   NOT NULL,
    [ModifiedDate]     DATETIME       DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_Common_OccupationType_OccupationTypeID] PRIMARY KEY CLUSTERED ([OccupationTypeID] ASC) WITH (FILLFACTOR = 95)
);

