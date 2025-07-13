CREATE TABLE [legal].[Attorney] (
    [Id]           INT           IDENTITY (1, 1) NOT NULL,
    [AttorneyName] VARCHAR (250) NOT NULL,
    [Department]   VARCHAR (50)  NULL,
    [IsActive]     BIT           DEFAULT ((1)) NOT NULL,
    [IsDeleted]    BIT           NOT NULL,
    [CreatedBy]    VARCHAR (100) NOT NULL,
    [CreatedDate]  DATETIME      NOT NULL,
    [ModifiedBy]   VARCHAR (100) NOT NULL,
    [ModifiedDate] DATETIME      NOT NULL,
    CONSTRAINT [PK_Attorney] PRIMARY KEY CLUSTERED ([Id] ASC)
);

