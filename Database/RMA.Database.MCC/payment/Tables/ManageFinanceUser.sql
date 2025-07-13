CREATE TABLE [payment].[ManageFinanceUser] (
    [ManageFinanceUserId] INT          IDENTITY (1, 1) NOT NULL,
    [RolePlayerId]        INT          NULL,
    [StartTimeOff]        DATETIME     NULL,
    [EndTimeOff]          DATETIME     NULL,
    [IsDeleted]           BIT          NOT NULL,
    [CreatedBy]           VARCHAR (50) NOT NULL,
    [CreatedDate]         DATETIME     NOT NULL,
    [ModifiedBy]          VARCHAR (50) NOT NULL,
    [ModifiedDate]        DATETIME     NOT NULL,
    CONSTRAINT [PK__ManageUser__0D8D1DED4A5B2C20] PRIMARY KEY CLUSTERED ([ManageFinanceUserId] ASC)
);

