CREATE TABLE [Load].[ConsolidatedFuneralInsurance](
	[Id] int identity not null,
	[FileIdentifier] [uniqueidentifier] NOT NULL,
	[IdNumber] varchar(32) NOT NULL,
	[PreviousInsurer] varchar(128),
	[PreviousInsurerPolicyNumber] varchar(64),
	[PreviousInsurerStartDate] varchar(16),
	[PreviousInsurerEndDate] varchar(16)	
 CONSTRAINT [PK__ConsolidatedFuneralInsurance] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE INDEX IDX_ConsolidatedFuneralInsurance ON [Load].[ConsolidatedFuneralInsurance] ([FileIdentifier]);
GO
