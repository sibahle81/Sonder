CREATE TABLE [Load].[GroupPolicyScheduleBatch] (
    [Id]                 INT           IDENTITY (1, 1) NOT NULL,
    [BatchId]            INT           NOT NULL,
    [ParentPolicyNumber] VARCHAR (50)  NOT NULL,
    [EmailAddress]       VARCHAR (255) NOT NULL,
    [PolicySchedule]     VARCHAR (255) NOT NULL,
    [TermsAndConditions] VARCHAR (255) NOT NULL,
    [IsProcessed]        BIT           DEFAULT ((0)) NOT NULL,
    [DateProcessed]      DATETIME      NULL,
    [CreatedBy]          VARCHAR (50)  NOT NULL,
    [CreatedDate]        DATETIME      DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]         VARCHAR (50)  NOT NULL,
    [ModifiedDate]       DATETIME      DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK__Load_GroupPolicyScheduleBatch] PRIMARY KEY CLUSTERED ([Id] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON)
);

