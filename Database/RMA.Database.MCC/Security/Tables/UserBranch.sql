CREATE TABLE [security].[UserBranch](
	[UserId] [int] NOT NULL,
	[BranchId] [int] NOT NULL,
	[DefaultBranch] [bit]  CONSTRAINT [DF_UserBranch_DefaultBranch]  DEFAULT ((0)) NULL,
	[IsActive] [bit] NOT NULL,
	[IsDeleted] [bit] NOT NULL,
	[CreatedBy] [varchar](50) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
    CONSTRAINT [PK_UserBranch] PRIMARY KEY CLUSTERED ([UserId] ASC, [BranchId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_UserBranch_User] FOREIGN KEY ([UserId]) REFERENCES [security].[User] ([Id]),
    CONSTRAINT [FK_UserBranch_Branch] FOREIGN KEY ([BranchId]) REFERENCES [common].[Branch] ([Id])
);