/*
USE [AZD-MCC]
GO
*/
/****** Object:  Table [common].[RolePlayerItemQueryItemTypeWizard]    Script Date: 2025/06/13 14:40:12 ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[common].[RolePlayerItemQueryItemTypeWizard]') AND type in (N'U'))
DROP TABLE [common].[RolePlayerItemQueryItemTypeWizard]
GO

/****** Object:  Table [common].[RolePlayerItemQueryItemTypeWizard]    Script Date: 2025/06/13 14:40:12 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [common].[RolePlayerItemQueryItemTypeWizard](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[RolePlayerQueryItemTypeId] [int] NOT NULL,
	[WizardConfigurationId] [int] NOT NULL,
	[IsDeleted] [bit] NOT NULL,
	[CreatedBy] [varchar](50) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_RolePlayerItemQueryItemTypeWizard] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


ALTER TABLE [common].[RolePlayerItemQueryItemTypeWizard]  WITH CHECK ADD  CONSTRAINT [FK_RolePlayerItemQueryItemTypeWizard_RolePlayerQueryItemType] FOREIGN KEY([RolePlayerQueryItemTypeId])
REFERENCES  [common].[RolePlayerQueryItemType] ([Id])
GO

ALTER TABLE [common].[RolePlayerItemQueryItemTypeWizard]  WITH CHECK ADD  CONSTRAINT [FK_RolePlayerItemQueryItemTypeWizard_WizardConfiguration] FOREIGN KEY([WizardConfigurationId])
REFERENCES  [bpm].[WizardConfiguration] ([Id])
GO
