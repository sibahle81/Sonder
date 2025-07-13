CREATE TABLE [Load].[PremiumListingCompany](
	[FileIdentifier] [uniqueidentifier] NOT NULL,
	[PolicyId] [int] NOT NULL,
	[PolicyNumber] [varchar](32) NOT NULL,
	[PolicyOwnerId] [int] NOT NULL,
	[CompanyName] [varchar](64) NOT NULL,
	[ProductOptionId] [int] NOT NULL,
	[PolicyInceptionDate] [date] NOT NULL,
	[CommissionPercentage] [decimal](8, 5) NOT NULL,
	[AdminPercentage] [decimal](8, 5) NOT NULL,
	[BinderFeePercentage] [decimal](8, 5) NOT NULL,
	[PremiumAdjustmentPercentage] [decimal](18, 10) NOT NULL,
	[PaymentFrequencyId] [int] NOT NULL,
	[IsDeleted] [bit] NOT NULL,
	[CreatedBy] [varchar](64) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](64) NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
	[IsEuropAssist] [bit] NOT NULL,
 CONSTRAINT [PK__PremiumL__FEDC0C3959F8E636] PRIMARY KEY CLUSTERED 
(
	[FileIdentifier] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [Load].[PremiumListingCompany] 
	ADD  CONSTRAINT [DF_PremiumListingCompany_PremiumAdjustmentPercentage]  DEFAULT ((0)) FOR [PremiumAdjustmentPercentage]
GO
