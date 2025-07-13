/*
USE [AZD-MCC]
GO
*/

/****** Object:  Table [common].[RolePlayerItemQueryResponse]    Script Date: 2025/06/13 14:17:35 ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[common].[RolePlayerItemQueryResponse]') AND type in (N'U'))
DROP TABLE [common].[RolePlayerItemQueryResponse]
GO

/****** Object:  Table [common].[RolePlayerItemQueryResponse]    Script Date: 2025/06/13 14:17:35 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [common].[RolePlayerItemQueryResponse](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[RolePlayerItemQueryId] [int] NOT NULL,
	[QueryResponse] [varchar](250) NOT NULL,
	[IsDeleted] [bit] NOT NULL,
	[CreatedBy] [varchar](50) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_RolePlayerItemQueryResponse] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


ALTER TABLE [common].[RolePlayerItemQueryResponse]  WITH CHECK ADD  CONSTRAINT [FK_RolePlayerItemQueryResponse_RolePlayerItemQuery] FOREIGN KEY([RolePlayerItemQueryId])
REFERENCES  [common].[RolePlayerItemQuery] ([Id])
GO