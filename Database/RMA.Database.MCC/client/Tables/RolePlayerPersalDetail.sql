CREATE TABLE [client].[RolePlayerPersalDetail] (
    [RolePlayerPersalDetailId] INT           IDENTITY (1, 1) NOT NULL,
    [RolePlayerId]             INT           NOT NULL,
    [PersalNumber]             VARCHAR (16)  NOT NULL,
    [Employer]                 VARCHAR (128) NULL,
    [Department]               VARCHAR (128) NULL,
    [IsDeleted]                BIT           DEFAULT ('0') NOT NULL,
    [CreatedBy]                VARCHAR (50)  DEFAULT ('system@randmutual.co.za') NOT NULL,
    [CreatedDate]              DATETIME      DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]               VARCHAR (50)  DEFAULT ('system@randmutual.co.za') NOT NULL,
    [ModifiedDate]             DATETIME      DEFAULT (getdate()) NOT NULL,
    PRIMARY KEY CLUSTERED ([RolePlayerPersalDetailId] ASC),
    CONSTRAINT [FK__RolePlaye__RoleP__59BF2B68] FOREIGN KEY ([RolePlayerId]) REFERENCES [client].[RolePlayer] ([RolePlayerId])
);

