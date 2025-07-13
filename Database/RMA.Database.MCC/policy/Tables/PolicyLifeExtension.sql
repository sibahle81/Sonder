CREATE TABLE [policy].[PolicyLifeExtension](
	[PolicyLifeExtensionId] [int] IDENTITY(1,1) NOT NULL,
	[PolicyId] [int] NOT NULL,
	[AnnualIncreaseTypeId] [int] NOT NULL,
	[AnnualIncreaseMonth] [int] NULL,
	[AffordabilityCheckPassed] [bit] NOT NULL,
	[AffordabilityCheckFailReason] [varchar](250) NULL,
	[IsEuropAssistExtended] [bit] NOT NULL,
	[IsDeleted] [bit] NOT NULL,
	[CreatedBy] [varchar](50) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_PolicyLifeExtension] PRIMARY KEY CLUSTERED 
(
	[PolicyLifeExtensionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
 CONSTRAINT [UC_PolicyId] UNIQUE NONCLUSTERED 
(
	[PolicyId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [policy].[PolicyLifeExtension] ADD  CONSTRAINT [DF_PolicyLifeExtension_AffordabilityCheckPassed]  DEFAULT ((1)) FOR [AffordabilityCheckPassed]
GO

ALTER TABLE [policy].[PolicyLifeExtension] ADD  CONSTRAINT [DF_PolicyLifeExtension_IsEuropAssistExtended]  DEFAULT ((0)) FOR [IsEuropAssistExtended]
GO

ALTER TABLE [policy].[PolicyLifeExtension] ADD  CONSTRAINT [DF_PolicyLifeExtension_IsDeleted]  DEFAULT ((0)) FOR [IsDeleted]
GO

ALTER TABLE [policy].[PolicyLifeExtension] ADD  CONSTRAINT [DF_PolicyLifeExtension_CreatedDate]  DEFAULT (getdate()) FOR [CreatedDate]
GO

ALTER TABLE [policy].[PolicyLifeExtension] ADD  CONSTRAINT [DF_PolicyLifeExtension_ModifiedDate]  DEFAULT (getdate()) FOR [ModifiedDate]
GO

ALTER TABLE [policy].[PolicyLifeExtension] ADD CONSTRAINT [FK_PolicyLifeExtension_PolicyId] FOREIGN KEY ([PolicyId]) REFERENCES [policy].[Policy] ([PolicyId])
GO

ALTER TABLE [policy].[PolicyLifeExtension] ADD CONSTRAINT [FK_PolicyLifeExtension_AnnualIncreaseType] FOREIGN KEY ([AnnualIncreaseTypeId]) REFERENCES [common].[AnnualIncreaseType] ([Id])
GO
