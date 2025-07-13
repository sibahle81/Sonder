/*
USE [AZD-MCC]
GO
*/

/****** Object:  Table [common].[RolePlayerItemQueryItemTypeRole]    Script Date: 2025/06/13 14:22:22 ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[common].[RolePlayerItemQueryItemTypeRole]') AND type in (N'U'))
DROP TABLE [common].[RolePlayerItemQueryItemTypeRole]
GO

/****** Object:  Table [common].[RolePlayerItemQueryItemTypeRole]    Script Date: 2025/06/13 14:22:22 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [common].[RolePlayerItemQueryItemTypeRole](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[RoleId] [int] NOT NULL,
	[RolePlayerQueryItemTypeId] [int] NOT NULL,
	[IsDeleted] [bit] NOT NULL,
	[CreatedBy] [varchar](50) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_RolePlayerItemQueryItemTypeRole] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [common].[RolePlayerItemQueryItemTypeRole]  WITH CHECK ADD  CONSTRAINT [FK_RolePlayerItemQueryItemTypeRole_Role] FOREIGN KEY([RoleId])
REFERENCES  [security].[Role] ([Id])
GO


ALTER TABLE [common].[RolePlayerItemQueryItemTypeRole]  WITH CHECK ADD  CONSTRAINT [FK_RolePlayerItemQueryItemTypeRole_RolePlayerQueryItemType] FOREIGN KEY([RolePlayerQueryItemTypeId])
REFERENCES  [common].[RolePlayerQueryItemType] ([Id])
GO
