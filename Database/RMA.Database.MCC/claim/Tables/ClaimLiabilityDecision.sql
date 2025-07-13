CREATE TABLE [claim].[ClaimLiabilityDecision] (
    [ClaimLiabilityDecisionId] INT           NOT NULL,
    [ClaimRequirementId]       INT           NOT NULL,
    [LiabilityDecisionTypeId]  INT           NOT NULL,
    [Description]              VARCHAR (255) NULL,
    [IsSection56]              BIT           NOT NULL,
    [IsAuthorisedFirst]        BIT           NOT NULL,
    [IsAuthorisedSecond]       BIT           NOT NULL,
    [IsDeleted]                BIT           NOT NULL,
    [CreatedBy]                VARCHAR (50)  NOT NULL,
    [CreatedDate]              DATETIME      NOT NULL,
    [ModifiedBy]               VARCHAR (50)  NOT NULL,
    [ModifiedDate]             DATETIME      NOT NULL,
    CONSTRAINT [PK__ClaimLiabilityDecision] PRIMARY KEY CLUSTERED ([ClaimLiabilityDecisionId] ASC),
    CONSTRAINT [FK_ClaimLiabilityDecision_ClaimRequirement] FOREIGN KEY ([ClaimRequirementId]) REFERENCES [claim].[ClaimRequirement] ([ClaimRequirementId]),
    CONSTRAINT [FK_ClaimLiabilityDecision_LiabilityDecisionType] FOREIGN KEY ([LiabilityDecisionTypeId]) REFERENCES [claim].[LiabilityDecisionType] ([LiabilityDecisionTypeId])
);

