CREATE TABLE [debt].[ActionLogs] (
    [Id]           INT            IDENTITY (1, 1) NOT NULL,
    [FinPayeeId]   INT            NOT NULL,
    [LogTitle]     VARCHAR (350)  NOT NULL,
    [Description]  VARCHAR (1000) NOT NULL,
    [AgentId]      INT            NOT NULL,
    [AssignDate]   DATETIME       NOT NULL,
    [AssignTime]   VARCHAR (20)   NOT NULL,
    [ActionType]   VARCHAR (100)  NOT NULL,
    [IsActive]     BIT            DEFAULT ((1)) NOT NULL,
    [IsDeleted]    BIT            NOT NULL,
    [CreatedBy]    VARCHAR (100)  NOT NULL,
    [CreatedDate]  DATETIME       NOT NULL,
    [ModifiedBy]   VARCHAR (100)  NOT NULL,
    [ModifiedDate] DATETIME       NOT NULL,
    CONSTRAINT [PK_ActionLogs] PRIMARY KEY CLUSTERED ([Id] ASC)
);

