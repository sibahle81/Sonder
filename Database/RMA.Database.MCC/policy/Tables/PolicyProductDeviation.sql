CREATE TABLE [policy].[PolicyProductDeviation](
	[ProductDeviationId] [int] IDENTITY(1,1) NOT NULL,
	[PolicyId] [int] NOT NULL,
	[ProductDeviationTypeId] [int] NOT NULL,
	[FromBenefitId] [int] NOT NULL,
	[ToBenefitId] [int] NOT NULL,
	[IsDeleted] [bit] NOT NULL,
	[CreatedBy] [varchar](50) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_Policy_ProductDeviation] PRIMARY KEY CLUSTERED 
(
	[PolicyId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [policy].[PolicyProductDeviation] ADD  CONSTRAINT [DF_PolicyProductDeviation_IsDeleted]  DEFAULT ((0)) FOR [IsDeleted]
GO

ALTER TABLE [policy].[PolicyProductDeviation] ADD  CONSTRAINT [DF_PolicyProductDeviation_CreatedBy]  DEFAULT ('system@randmutual.co.za') FOR [CreatedBy]
GO

ALTER TABLE [policy].[PolicyProductDeviation] ADD  CONSTRAINT [DF_PolicyProductDeviations_CreatedDate]  DEFAULT (getdate()) FOR [CreatedDate]
GO

ALTER TABLE [policy].[PolicyProductDeviation] ADD  CONSTRAINT [DF_PolicyProductDeviation_ModifiedBy]  DEFAULT ('system@randmutual.co.za') FOR [ModifiedBy]
GO

ALTER TABLE [policy].[PolicyProductDeviation] ADD  CONSTRAINT [DF_PolicyProductDeviation_ModifiedDate]  DEFAULT (getdate()) FOR [ModifiedDate]
GO

ALTER TABLE [policy].[PolicyProductDeviation]  WITH CHECK ADD  CONSTRAINT [FK_PolicyProductDeviation_FromBenefitId] FOREIGN KEY([FromBenefitId])
REFERENCES [product].[Benefit] ([Id])
GO

ALTER TABLE [policy].[PolicyProductDeviation] CHECK CONSTRAINT [FK_PolicyProductDeviation_FromBenefitId]
GO

ALTER TABLE [policy].[PolicyProductDeviation]  WITH CHECK ADD  CONSTRAINT [FK_PolicyProductDeviation_Policy] FOREIGN KEY([PolicyId])
REFERENCES [policy].[Policy] ([PolicyId])
GO

ALTER TABLE [policy].[PolicyProductDeviation] CHECK CONSTRAINT [FK_PolicyProductDeviation_Policy]
GO

ALTER TABLE [policy].[PolicyProductDeviation]  WITH CHECK ADD  CONSTRAINT [FK_PolicyProductDeviation_ProductDeviationType] FOREIGN KEY([ProductDeviationTypeId])
REFERENCES [common].[ProductDeviationType] ([Id])
GO

ALTER TABLE [policy].[PolicyProductDeviation] CHECK CONSTRAINT [FK_PolicyProductDeviation_ProductDeviationType]
GO

ALTER TABLE [policy].[PolicyProductDeviation]  WITH CHECK ADD  CONSTRAINT [FK_PolicyProductDeviation_ToBenefitId] FOREIGN KEY([ToBenefitId])
REFERENCES [product].[Benefit] ([Id])
GO

ALTER TABLE [policy].[PolicyProductDeviation] CHECK CONSTRAINT [FK_PolicyProductDeviation_ToBenefitId]
GO


