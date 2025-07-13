CREATE TABLE [claim].[EstimateTypes] (
    [EstimateTypeId]       INT            IDENTITY (1, 1) NOT NULL,
    [Name]                 VARCHAR (50)   NOT NULL,
    [Description]          VARCHAR (2048) NULL,
    [IsAlwaysApplicable]   BIT            CONSTRAINT [DF_EstimateType_IsAlwaysApplicable] DEFAULT ((0)) NOT NULL,
    [ClaimEstimateGroupId] INT            NOT NULL,
    [IsRecoverable]        BIT            CONSTRAINT [DF_EstimateType_IsRecoverable] DEFAULT ((0)) NOT NULL,
    [IncludeVat]           BIT            NULL,
    [IsDeleted]            BIT            NOT NULL,
    [CreatedBy]            VARCHAR (50)   NOT NULL,
    [CreatedDate]          DATETIME       NOT NULL,
    [ModifiedBy]           VARCHAR (50)   NOT NULL,
    [ModifiedDate]         DATETIME       NOT NULL,
    CONSTRAINT [PK_EstimateType] PRIMARY KEY CLUSTERED ([EstimateTypeId] ASC),
    CONSTRAINT [FK_EstimateType_ClaimEstimateGroup] FOREIGN KEY ([ClaimEstimateGroupId]) REFERENCES [claim].[ClaimEstimateGroup] ([ClaimEstimateGroupId])
);

