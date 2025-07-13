/*
USE [AZD-MCC]
GO
*/

/****** Object:  Table [common].[RolePlayerItemQuery]    Script Date: 2025/06/13 14:06:34 ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[common].[RolePlayerItemQuery]') AND type in (N'U'))
DROP TABLE [common].[RolePlayerItemQuery]
GO

/****** Object:  Table [common].[RolePlayerItemQuery]    Script Date: 2025/06/13 14:06:34 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [common].[RolePlayerItemQuery](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[RolePlayerItemQueryTypeId] [int] NOT NULL,
	[RolePlayerId] [int] NOT NULL,
	[RolePlayerQueryItemTypeId] [int] NOT NULL,
	[RolePlayerItemQueryCategoryId] [int] NOT NULL,
	[RolePlayerItemQueryStatusId] [int] NOT NULL,
	[QueryDescription] [varchar](250) NOT NULL,
	[IsDeleted] [bit] NOT NULL,
	[CreatedBy] [varchar](50) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_RolePlayerItemQuery] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [common].[RolePlayerItemQuery]  WITH CHECK ADD  CONSTRAINT [FK_RolePlayerItemQuery_RolePlayerItemQueryType] FOREIGN KEY([RolePlayerItemQueryTypeId])
REFERENCES  [common].[RolePlayerItemQueryType] ([Id])
GO

ALTER TABLE [common].[RolePlayerItemQuery]  WITH CHECK ADD  CONSTRAINT [FK_RolePlayerItemQuery_RolePlayer] FOREIGN KEY([RolePlayerId])
REFERENCES  [client].[RolePlayer] ([RolePlayerId])
GO

ALTER TABLE [common].[RolePlayerItemQuery]  WITH CHECK ADD  CONSTRAINT [FK_RolePlayerItemQuery_RolePlayerQueryItemType] FOREIGN KEY([RolePlayerQueryItemTypeId])
REFERENCES  [common].[RolePlayerQueryItemType] ([Id])
GO

ALTER TABLE [common].[RolePlayerItemQuery]  WITH CHECK ADD  CONSTRAINT [FK_RolePlayerItemQuery_RolePlayerItemQueryCategory] FOREIGN KEY([RolePlayerItemQueryCategoryId])
REFERENCES  [common].[RolePlayerItemQueryCategory] ([Id])
GO

ALTER TABLE [common].[RolePlayerItemQuery]  WITH CHECK ADD  CONSTRAINT [FK_RolePlayerItemQuery_RolePlayerItemQueryStatus] FOREIGN KEY([RolePlayerItemQueryStatusId])
REFERENCES  [common].[RolePlayerItemQueryStatus] ([Id])
GO

