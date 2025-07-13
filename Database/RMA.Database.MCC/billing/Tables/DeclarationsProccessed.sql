CREATE TABLE [billing].[DeclarationsProccessed] (
    [DeclarationProccessedId] INT          IDENTITY (1, 1) NOT NULL,
    [DeclarationId]           INT          NOT NULL,
    [IsDeleted]               BIT          CONSTRAINT [DF_DeclarationsProccessed_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]               VARCHAR (50) NOT NULL,
    [CreatedDate]             DATETIME     CONSTRAINT [DF_DeclarationsProccessed_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]              VARCHAR (50) NOT NULL,
    [ModifiedDate]            DATETIME     CONSTRAINT [DF_DeclarationsProccessed_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_DeclarationProccessing] PRIMARY KEY CLUSTERED ([DeclarationProccessedId] ASC),
    CONSTRAINT [FK_DeclarationsProccessed_Declaration] FOREIGN KEY ([DeclarationId]) REFERENCES [client].[Declaration] ([DeclarationId])
);



