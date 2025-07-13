CREATE TABLE [legal].[ActionLog] (
    [Id]           INT            IDENTITY (1, 1) NOT NULL,
    [ReferralId]   INT            NOT NULL,
    [Title]        VARCHAR (250)  NOT NULL,
    [Comment]      VARCHAR (2000) NULL,
    [AddedByUser]  VARCHAR (100)  NOT NULL,
    [Date]         DATETIME       NOT NULL,
    [Time]         VARCHAR (20)   NOT NULL,
    [CustomerName] VARCHAR (250)  NOT NULL,
    [ModuleId]     INT            NOT NULL,
    [ActionType]   VARCHAR (100)  NOT NULL,
    [IsActive]     BIT            DEFAULT ((1)) NOT NULL,
    [IsDeleted]    BIT            NOT NULL,
    [CreatedBy]    VARCHAR (100)  NOT NULL,
    [CreatedDate]  DATETIME       NOT NULL,
    [ModifiedBy]   VARCHAR (100)  NOT NULL,
    [ModifiedDate] DATETIME       NOT NULL,
    CONSTRAINT [PK_ActionLog] PRIMARY KEY CLUSTERED ([Id] ASC)
);

