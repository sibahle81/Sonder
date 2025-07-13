USE [AZD-MCC]
GO

/****** Object:  Table [claim].[TravelRateType]    Script Date: 2025/06/13 09:39:20 ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[common].[RolePlayerItemQueryType]') AND type in (N'U'))
DROP TABLE [common].[RolePlayerItemQueryType]
GO

/****** Object:  Table [claim].[TravelRateType]    Script Date: 2025/06/13 09:39:20 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [common].[RolePlayerItemQueryType](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [varchar](50) NOT NULL,
 CONSTRAINT [PK_RolePlayerItemQueryType] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


