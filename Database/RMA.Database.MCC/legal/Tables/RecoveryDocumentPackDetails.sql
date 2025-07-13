CREATE TABLE [legal].[RecoveryDocumentPackDetails] (
    [Id]             INT           IDENTITY (1, 1) NOT NULL,
    [DocumentPackId] INT           NOT NULL,
    [DocumentId]     INT           NOT NULL,
    [DocumentName]   VARCHAR (500) NOT NULL,
    [ReferralId]     INT           NOT NULL,
    [IsActive]       BIT           DEFAULT ((1)) NOT NULL,
    [IsDeleted]      BIT           NOT NULL,
    [CreatedBy]      VARCHAR (100) NOT NULL,
    [CreatedDate]    DATETIME      NOT NULL,
    [ModifiedBy]     VARCHAR (100) NOT NULL,
    [ModifiedDate]   DATETIME      NOT NULL,
    CONSTRAINT [PK_DocumentPackDetails] PRIMARY KEY CLUSTERED ([Id] ASC)
);

