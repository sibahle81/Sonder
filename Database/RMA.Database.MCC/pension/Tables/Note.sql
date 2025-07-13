CREATE TABLE [pension].[Note] (
    [Id]           INT           IDENTITY (1, 1) NOT NULL,
    [ItemId]       INT           NOT NULL,
    [ItemType]     VARCHAR (50)  NOT NULL,
    [Title]        VARCHAR (100) NULL,
    [Text]         VARCHAR (MAX) NOT NULL,
    [IsActive]     BIT           NOT NULL,
    [IsDeleted]    BIT           NOT NULL,
    [CreatedBy]    VARCHAR (50)  NOT NULL,
    [CreatedDate]  DATETIME      NOT NULL,
    [ModifiedBy]   VARCHAR (50)  NOT NULL,
    [ModifiedDate] DATETIME      NOT NULL,
    CONSTRAINT [PK__Notes__3214EC078779F33D] PRIMARY KEY CLUSTERED ([Id] ASC)
);



