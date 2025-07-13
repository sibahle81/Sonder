CREATE TABLE [policy].[PolicyInsuredLifeAdditionalBenefits](
	[PolicyId] [int] NOT NULL,
	[RolePlayerId] [int] NOT NULL,
	[BenefitId] [int] NOT NULL,
	[IsDeleted] [bit] NOT NULL,
	[CreatedBy] [varchar](50) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_PolicyInsuredLivesAdditionalBenefits] PRIMARY KEY CLUSTERED
(
	[PolicyId] ASC,
	[RolePlayerId] ASC,
	[BenefitId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [policy].[PolicyInsuredLifeAdditionalBenefits] ADD  CONSTRAINT [DF_PolicyInsuredLivesAdditionalBenefits_IsDeleted]  DEFAULT ((0)) FOR [IsDeleted]
GO

ALTER TABLE [policy].[PolicyInsuredLifeAdditionalBenefits] ADD  CONSTRAINT [DF_PolicyInsuredLivesAdditionalBenefits_CreatedBy]  DEFAULT ('system@randmutual.co.za') FOR [CreatedBy]
GO

ALTER TABLE [policy].[PolicyInsuredLifeAdditionalBenefits] ADD  CONSTRAINT [DF_PolicyInsuredLivesAdditionalBenefits_CreatedDate]  DEFAULT (getdate()) FOR [CreatedDate]
GO

ALTER TABLE [policy].[PolicyInsuredLifeAdditionalBenefits] ADD  CONSTRAINT [DF_PolicyInsuredLivesAdditionalBenefits_ModifiedBy]  DEFAULT ('system@randmutual.co.za') FOR [ModifiedBy]
GO

ALTER TABLE [policy].[PolicyInsuredLifeAdditionalBenefits] ADD  CONSTRAINT [DF_PolicyInsuredLivesAdditionalBenefits_ModifiedDate]  DEFAULT (getdate()) FOR [ModifiedDate]
GO

ALTER TABLE [policy].[PolicyInsuredLifeAdditionalBenefits] ADD CONSTRAINT [FK_PolicyInsuredLivesAdditionalBenefits_PolicyInsuredLives] FOREIGN KEY ([PolicyId], [RolePlayerId]) REFERENCES [policy].[PolicyInsuredLives]([PolicyId], [RolePlayerId]);
GO

ALTER TABLE [policy].[PolicyInsuredLifeAdditionalBenefits] ADD CONSTRAINT [FK_PolicyInsuredLivesAdditionalBenefits_Benefit] FOREIGN KEY ([BenefitId]) REFERENCES [product].[Benefit]([Id]);
GO
