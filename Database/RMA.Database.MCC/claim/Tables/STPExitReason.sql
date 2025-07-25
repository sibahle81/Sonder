﻿CREATE TABLE [claim].[STPExitReason](
	[STPExitReasonID] [int] NOT NULL,
	[Name] [varchar](100) NOT NULL,
	[Description] [varchar](350) NOT NULL,
 CONSTRAINT [PK_STPExitReason] PRIMARY KEY CLUSTERED 
(
	[STPExitReasonID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO