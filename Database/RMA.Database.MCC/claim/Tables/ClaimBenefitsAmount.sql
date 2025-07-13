CREATE TABLE [claim].[ClaimBenefitsAmount] (
    [ClaimBenefitAmountId]      INT           IDENTITY (1, 1) NOT NULL,
    [BenefitName]               VARCHAR (255) NOT NULL,
    [BenefitType]               INT           NOT NULL,
    [Description]               VARCHAR (255) NOT NULL,
    [Formula]                   VARCHAR (255) NULL,
    [MinimumCompensationAmount] VARCHAR (255) NULL,
    [MaximumCompensationAmount] VARCHAR (255) NULL,
    [LinkedBenefits]            VARCHAR (255) NULL,
    [StartDate]                 DATETIME      NULL,
    [EndDate]                   DATETIME      NULL,
    [IsDeleted]                 BIT           NOT NULL,
    [CreatedBy]                 VARCHAR (255) NOT NULL,
    [CreatedDate]               DATETIME      NOT NULL,
    [ModifiedBy]                VARCHAR (255) NOT NULL,
    [ModifiedDate]              DATETIME      NOT NULL,
    CONSTRAINT [PK__ClaimBen__AC4D7D6036D9C971] PRIMARY KEY CLUSTERED ([ClaimBenefitAmountId] ASC),
    CONSTRAINT [Foreign_Key_BenefitType] FOREIGN KEY ([BenefitType]) REFERENCES [claim].[ClaimBenefitType] ([ClaimBenefitTypeId])
);

