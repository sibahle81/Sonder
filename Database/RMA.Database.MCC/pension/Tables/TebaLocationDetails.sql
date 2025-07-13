CREATE TABLE [pension].[TebaLocationDetails](
	[TebaLocationDetailsId] [int] IDENTITY(1,1) NOT NULL,
	[OfficialName] [varchar](100) NULL,
	[Description] [varchar](100) NULL,
	[WorkNumber] [varchar](50) NOT NULL,
	[FaxNumber] [varchar](50) NULL,
	[Email] [varchar](100) NULL,
	[IsManuallyModified] [bit] CONSTRAINT [DF_TebaLocationDetails_IsManuallyModified] DEFAULT ((0)) NOT NULL,
	[IsActive] [bit] NOT NULL,
	[IsDeleted] [bit] NOT NULL,
	[CreatedBy] [varchar](50) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
    CONSTRAINT [PK_TebaLocationDetails] PRIMARY KEY CLUSTERED ([TebaLocationDetailsId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON)
);