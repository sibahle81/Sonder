CREATE TABLE [pension].[Visit](
	[VisitId] [int] IDENTITY(1,1) NOT NULL,
	[PensionerId] [int] NOT NULL,
	[DateVisited] [datetime] NOT NULL,
	[ServiceId] [int] NOT NULL,
    [ClinicVenueId] [int] NOT NULL,
	[Comment] [varchar](8000) NOT NULL,
	[IsActive] [bit] NOT NULL,
	[IsDeleted] [bit] NOT NULL,
	[CreatedBy] [varchar](50) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
    CONSTRAINT [PK_Visit] PRIMARY KEY CLUSTERED ([VisitId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_Visit_Pensioner] FOREIGN KEY ([PensionerId]) REFERENCES [pension].[Pensioner] ([PensionerId]),
    CONSTRAINT [FK_Visit_Service] FOREIGN KEY ([ServiceId]) REFERENCES [medical].[Service] ([ServiceId]),
    CONSTRAINT [FK_Visit_ClinicVenue] FOREIGN KEY ([ClinicVenueId]) REFERENCES [medical].[ClinicVenue] ([ClinicVenueID])
);