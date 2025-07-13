CREATE TABLE [billing].[TermsArrangementNote] (
    [Id]                INT           IDENTITY (1, 1) NOT NULL,
    [TermArrangementId] INT           NOT NULL,
    [ItemId]            INT           NOT NULL,
    [ItemType]          INT           NOT NULL,
    [Text]              VARCHAR (MAX) NOT NULL,
    [IsActive]          BIT           NOT NULL,
    [IsDeleted]         BIT           NOT NULL,
    [CreatedBy]         VARCHAR (50)  NOT NULL,
    [CreatedDate]       DATETIME      NOT NULL,
    [ModifiedBy]        VARCHAR (50)  NOT NULL,
    [ModifiedDate]      DATETIME      NOT NULL,
    CONSTRAINT [PK_billing.TermsArrangementNote] PRIMARY KEY CLUSTERED ([Id] ASC),
    FOREIGN KEY ([TermArrangementId]) REFERENCES [billing].[TermArrangement] ([TermArrangementId])
);






GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO


