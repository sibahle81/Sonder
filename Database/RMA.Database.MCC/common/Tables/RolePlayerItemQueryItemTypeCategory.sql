/*
USE [AZD-MCC]
GO
*/
/****** Object:  Table [common].[RolePlayerItemQueryItemTypeCategory]    Script Date: 2025/06/13 14:28:37 ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[common].[RolePlayerItemQueryItemTypeCategory]') AND type in (N'U'))
DROP TABLE [common].[RolePlayerItemQueryItemTypeCategory]
GO

/****** Object:  Table [common].[RolePlayerItemQueryItemTypeCategory]    Script Date: 2025/06/13 14:28:37 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [common].[RolePlayerItemQueryItemTypeCategory](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[RolePlayerQueryItemTypeId] [int] NOT NULL,
	[RolePlayerItemQueryCategoryId] [int] NOT NULL,
	[IsDeleted] [bit] NOT NULL,
	[CreatedBy] [varchar](50) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_RolePlayerItemQueryItemTypeCategory] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


ALTER TABLE [common].[RolePlayerItemQueryItemTypeCategory]  WITH CHECK ADD  CONSTRAINT [FK_RolePlayerItemQueryItemTypeCategory_RolePlayerQueryItemType] FOREIGN KEY([RolePlayerQueryItemTypeId])
REFERENCES  [common].[RolePlayerQueryItemType] ([Id])
GO

ALTER TABLE [common].[RolePlayerItemQueryItemTypeCategory]  WITH CHECK ADD  CONSTRAINT [FK_RolePlayerItemQueryItemTypeCategory_RolePlayerItemQueryCategory] FOREIGN KEY([RolePlayerItemQueryCategoryId])
REFERENCES  [common].[RolePlayerItemQueryCategory] ([Id])
GO
