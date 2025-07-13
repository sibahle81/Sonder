CREATE TABLE [pension].[TebaLocation] (
    [TebaLocationID]     INT           IDENTITY (1, 1) NOT NULL,
    [BranchName]         VARCHAR (100) NULL,
    [Address1]           VARCHAR (100) NULL,
    [City]               VARCHAR (100) NULL,
    [PostalCode]         VARCHAR (20)  NULL,
    [RegioncodeID]       INT           NULL,
    [CountryID]          INT           NULL,
    [IsManuallyModified] BIT           CONSTRAINT [DF_TebaLocation_IsManuallyModified] DEFAULT ((0)) NOT NULL,
    [PMPRegionID]        INT           NULL,
    [CreatedBy]          VARCHAR (50)  NOT NULL,
    [CreatedDate]        DATETIME      NOT NULL,
    [ModifiedBy]         VARCHAR (50)  NOT NULL,
    [ModifiedDate]       DATETIME      NOT NULL,
    [RegionGroupID]      INT           NULL,
    CONSTRAINT [PK_Pension_TebaLocation_TebaLocationID] PRIMARY KEY CLUSTERED ([TebaLocationID] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_Pension_TebaLocation_PMPRegionID] FOREIGN KEY ([PMPRegionID]) REFERENCES [common].[PMPRegion] ([PMPRegionID]),
    CONSTRAINT [FK_Pension_TebaLocation_RegioncodeID] FOREIGN KEY ([RegioncodeID]) REFERENCES [common].[RegionCode] ([RegionCodeID])
);

