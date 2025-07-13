/*
USE [AZD-MCC]
GO
*/
/****** Object:  Table [common].[RolePlayerItemQueryItems]    Script Date: 2025/06/13 14:33:02 ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[common].[RolePlayerItemQueryItems]') AND type in (N'U'))
DROP TABLE [common].[RolePlayerItemQueryItems]
GO

/****** Object:  Table [common].[RolePlayerItemQueryItems]    Script Date: 2025/06/13 14:33:02 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [common].[RolePlayerItemQueryItems](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[RolePlayerItemQueryId] [int] NOT NULL,
	[ItemId] [int] NOT NULL,
	[IsDeleted] [bit] NOT NULL,
	[CreatedBy] [varchar](50) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_RolePlayerItemQueryItems] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


ALTER TABLE [common].[RolePlayerItemQueryItems]  WITH CHECK ADD  CONSTRAINT [FK_RolePlayerItemQueryItems_RolePlayerItemQuery] FOREIGN KEY([RolePlayerItemQueryId])
REFERENCES  [common].[RolePlayerItemQuery] ([Id])
GO