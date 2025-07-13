CREATE TABLE [pension].[AgencyBranch] (
    [AgencyBranchID]       INT          IDENTITY (1, 1) NOT NULL,
    [BranchName]           VARCHAR (50) NOT NULL,
    [BranchCode]           VARCHAR (20) NOT NULL,
    [AgencyTypeID]         INT          NOT NULL,
    [CountryID]            INT          NULL,
    [RegioncodeID]         INT          NULL,
    [ParentAgencyBranchID] INT          NULL,
    [IsActive]             BIT          DEFAULT ((1)) NOT NULL,
    [IsDeleted]            BIT          NOT NULL,
    [CreatedBy]            VARCHAR (50) NOT NULL,
    [CreatedDate]          DATETIME     NOT NULL,
    [ModifiedBy]           VARCHAR (50) NOT NULL,
    [ModifiedDate]         DATETIME     NOT NULL,
    CONSTRAINT [PK_Pension_AgencyBranch_AgencyBranchID] PRIMARY KEY CLUSTERED ([AgencyBranchID] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON)
);

