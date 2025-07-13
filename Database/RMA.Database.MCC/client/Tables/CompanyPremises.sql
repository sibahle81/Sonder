CREATE TABLE [client].[CompanyPremises](
	[CompanyPremisesId] [int] IDENTITY(1000,1) NOT NULL,
	[RolePlayerId] [int] NOT NULL,
	[Name] [varchar](100) NULL,
	[Description] [varchar](2048) NULL,
	[DMECode] [varchar](50) NULL,
	[BranchId] [int] NULL,
	[IsActive] [bit] NOT NULL,
	[IsDeleted] [bit] NOT NULL,
	[CreatedBy] [varchar](50) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
    CONSTRAINT [PK_CompanyPremises] PRIMARY KEY CLUSTERED ([CompanyPremisesId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_CompanyPremises_Company] FOREIGN KEY ([RolePlayerId]) REFERENCES [client].[Company] ([RolePlayerId]),
    CONSTRAINT [FK_CompanyPremises_Branch] FOREIGN KEY ([BranchId]) REFERENCES [common].[Branch] ([Id])
);