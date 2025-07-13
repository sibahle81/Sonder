CREATE TABLE [common].[PostalCodeRange](
	[PostalCodeRangeId] [int] IDENTITY(1,1) NOT NULL,
	[FromPostalCode] [varchar](4) NOT NULL,
	[ToPostalCode] [varchar](4) NOT NULL,
	[RegionCodeId] [int] NOT NULL,
	[PMPRegionId] [int] NULL,
	[BranchId] [int] NULL,
	[IsActive] [bit] NOT NULL,
	[IsDeleted] [bit] NOT NULL,
	[CreatedBy] [varchar](50) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
    CONSTRAINT [PK_PostalCodeRange] PRIMARY KEY CLUSTERED ([PostalCodeRangeId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_PostalCodeRange_RegionCode] FOREIGN KEY ([RegioncodeId]) REFERENCES [common].[RegionCode] ([RegionCodeID]),
    CONSTRAINT [FK_PostalCodeRange_PMPRegion] FOREIGN KEY ([PMPRegionId]) REFERENCES [common].[PMPRegion] ([PMPRegionID])
);