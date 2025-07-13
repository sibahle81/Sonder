CREATE TABLE [pension].[BeneficiaryTypeMap] (
    [Id]                      INT          IDENTITY (1, 1) NOT NULL,
    [ModBeneficiaryTypeName]  VARCHAR (50) NOT NULL,
    [ModBeneficiaryTypeId]    INT          NOT NULL,
    [CompBeneficiaryTypeName] VARCHAR (50) NULL,
    [CompBeneficiaryTypeId]   INT          NULL,
    [IsActive]                BIT          CONSTRAINT [DF_BeneficiaryTypeMapping_IsActive] DEFAULT ((0)) NOT NULL,
    [IsDeleted]               BIT          CONSTRAINT [DF_BeneficiaryTypeMapping_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]               VARCHAR (50) CONSTRAINT [DF_BeneficiaryTypeMapping_CreatedBy] DEFAULT ('System') NOT NULL,
    [CreatedDate]             DATETIME     CONSTRAINT [DF_BeneficiaryTypeMapping_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]              VARCHAR (50) CONSTRAINT [DF_BeneficiaryTypeMapping_ModifiedBy] DEFAULT ('System') NOT NULL,
    [ModifiedDate]            DATETIME     CONSTRAINT [DF_BeneficiaryTypeMapping_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_BeneficiaryTypeMapping] PRIMARY KEY CLUSTERED ([Id] ASC)
);

