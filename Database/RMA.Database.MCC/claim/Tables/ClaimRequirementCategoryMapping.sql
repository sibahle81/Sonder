CREATE TABLE [claim].[ClaimRequirementCategoryMapping] (
    [ClaimRequirementCategoryMappingId] INT           IDENTITY (1, 1) NOT NULL,
    [ClaimRequirementCategoryId]        INT           NOT NULL,
    [EventTypeId]                       INT           NOT NULL,
    [isFatal]                           BIT           CONSTRAINT [DF_ClaimRequirementCategoryMapping_isFatal] DEFAULT ((0)) NOT NULL,
    [IsMVA]                             BIT           CONSTRAINT [DF__ClaimRequ__IsMVA__0CE9C9B3] DEFAULT ((0)) NOT NULL,
    [IsTrainee]                         BIT           CONSTRAINT [DF__ClaimRequ__IsTra__0DDDEDEC] DEFAULT ((0)) NOT NULL,
    [isAssault]                         BIT           CONSTRAINT [DF__ClaimRequ__isAss__0ED21225] DEFAULT ((0)) NOT NULL,
    [isDeleted]                         BIT           CONSTRAINT [DF__ClaimRequ__isDel__0FC6365E] DEFAULT ((0)) NOT NULL,
    [CreatedBy]                         VARCHAR (100) NOT NULL,
    [CreatedDate]                       DATETIME      CONSTRAINT [DF__ClaimRequ__Creat__10BA5A97] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]                        VARCHAR (100) NOT NULL,
    [ModifiedDate]                      DATETIME      CONSTRAINT [DF__ClaimRequ__Modif__11AE7ED0] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK__ClaimReq__4F7CFA7E92AAD1DD] PRIMARY KEY CLUSTERED ([ClaimRequirementCategoryMappingId] ASC),
    CONSTRAINT [FK_ClaimRequirementCategoryMapping_ClaimRequirementCategory] FOREIGN KEY ([ClaimRequirementCategoryId]) REFERENCES [claim].[ClaimRequirementCategory] ([ClaimRequirementCategoryId]),
    CONSTRAINT [FK_ClaimRequirementCategoryMapping_EventType] FOREIGN KEY ([EventTypeId]) REFERENCES [common].[EventType] ([Id])
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

