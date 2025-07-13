CREATE TABLE [Load].[ConsolidatedFuneralBank](
	[Id] int identity not null,
	[FileIdentifier] [uniqueidentifier] NOT NULL,
	[IdNumber] varchar(32) NOT NULL,
	[Bank] varchar(64) NOT NULL,
	[BranchCode]  varchar(16) NOT NULL,
	[AccountNo] varchar(32) NOT NULL,
	[AccountType] varchar(32) NOT NULL
 CONSTRAINT [PK__ConsolidatedFuneralBank] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE INDEX IDX_ConsolidatedFuneralBank ON [Load].[ConsolidatedFuneralBank] ([FileIdentifier]);
GO