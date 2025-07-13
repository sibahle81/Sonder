CREATE TABLE [security].[UserPMPRegion](
	[UserId] [int] NOT NULL,
	[PMPRegionId] [int] NOT NULL,
	[IsDefaultRegion] [bit] CONSTRAINT [DF_UserPMPRegion_IsDefaultRegion] DEFAULT ((0)) NOT NULL,
	[PreferredMCA] [bit] NULL,
	[IsActive] [bit] NOT NULL,
	[IsDeleted] [bit] NOT NULL,
	[CreatedBy] [varchar](50) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
    CONSTRAINT [PK_UserPMPRegion] PRIMARY KEY CLUSTERED ([UserId] ASC, [PMPRegionId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_UserPMPRegion_PMPRegion] FOREIGN KEY ([PMPRegionId]) REFERENCES [common].[PMPRegion] ([PMPRegionID]),
    CONSTRAINT [FK_UserPMPRegion_User] FOREIGN KEY ([UserId]) REFERENCES [security].[User] ([Id])
);