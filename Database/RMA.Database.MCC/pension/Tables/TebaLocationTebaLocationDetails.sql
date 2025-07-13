CREATE TABLE [pension].[TebaLocationTebaLocationDetails](
	[TebaLocationTebaLocationDetailsId] [int] IDENTITY(1,1) NOT NULL,
	[TebaLocationId] [int] NULL,
	[TebaLocationDetailsId] [int] NULL,
	[IsActive] [bit] NOT NULL,
	[IsDeleted] [bit] NOT NULL,
	[CreatedBy] [varchar](50) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
    CONSTRAINT [PK_TebaLocationTebaLocationDetails] PRIMARY KEY CLUSTERED ([TebaLocationTebaLocationDetailsId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_TebaLocationTebaLocationDetails_TebaLocationDetails] FOREIGN KEY ([TebaLocationDetailsId]) REFERENCES [pension].[TebaLocationDetails] ([TebaLocationDetailsId]),
    CONSTRAINT [FK_TebalocationTebalocationDetails_TebaLocation] FOREIGN KEY ([TebaLocationId]) REFERENCES [pension].[TebaLocation] ([TebaLocationID])
);