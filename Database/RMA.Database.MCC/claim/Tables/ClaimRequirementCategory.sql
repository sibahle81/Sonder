CREATE TABLE [claim].[ClaimRequirementCategory] (
    [ClaimRequirementCategoryId]        INT           IDENTITY (1, 1) NOT NULL,
    [Name]                              VARCHAR (150) NOT NULL,
    [Description]                       VARCHAR (150) NOT NULL,
    [isManuallyAdded]                   BIT           DEFAULT ((0)) NOT NULL,
    [isManuallyClosed]                  BIT           DEFAULT ((0)) NOT NULL,
    [IsBlockClaimChangeMacroStatus]     BIT           DEFAULT ((0)) NOT NULL,
    [IsBlockClaimChangeStatus]          BIT           DEFAULT ((0)) NOT NULL,
    [IsBlockClaimChangeLiabilityStatus] BIT           DEFAULT ((0)) NOT NULL,
    [IsMemberVisible]                   BIT           DEFAULT ((0)) NOT NULL,
    [IsOutstandingReason]               BIT           DEFAULT ((0)) NOT NULL,
    [IsPersonEventRequirement]          BIT           DEFAULT ((0)) NOT NULL,
    [IsAssurerVisible]                  BIT           DEFAULT ((0)) NOT NULL,
    [IsBlockCloseClaim]                 BIT           DEFAULT ((0)) NOT NULL,
    [Code]                              VARCHAR (50)  NULL,
    [isActive]                          BIT           DEFAULT ((0)) NOT NULL,
    [isDeleted]                         BIT           DEFAULT ((0)) NOT NULL,
    [CreatedBy]                         VARCHAR (100) NOT NULL,
    [CreatedDate]                       DATETIME      DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]                        VARCHAR (100) NOT NULL,
    [ModifiedDate]                      DATETIME      DEFAULT (getdate()) NOT NULL,
    [DocumentTypeId]                    INT           NULL,
    PRIMARY KEY CLUSTERED ([ClaimRequirementCategoryId] ASC),
    CONSTRAINT [FK_ClaimRequirementCategory_DocumentType] FOREIGN KEY ([DocumentTypeId]) REFERENCES [common].[DocumentType] ([Id])
);


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO

