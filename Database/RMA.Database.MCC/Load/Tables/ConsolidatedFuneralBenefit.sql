CREATE TABLE [Load].[ConsolidatedFuneralBenefit](
	[FileIdentifier] [uniqueidentifier] NOT NULL,
	[BenefitName] [varchar](128) NOT NULL,
	[ProductOptionId] [int] NULL,
	[BenefitId] [int] NULL,
	[CoverMemberTypeId] [int] NULL,
	[MaxPersonsPerProductOption] [int] NULL default(999),
	[MaxPersonsPerBenefit] [int] NULL default(999),
	[MinEntryAge] [int] NULL default(0),
	[MaxEntryAge] [int] NULL default(999),
	[CapCover] [decimal](18, 2) NULL default(104000)
 CONSTRAINT [PK__ConsolidatedFuneralBenefit] PRIMARY KEY CLUSTERED 
(
	[FileIdentifier] ASC,
	[BenefitName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

