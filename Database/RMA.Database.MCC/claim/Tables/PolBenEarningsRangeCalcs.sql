CREATE TABLE [claim].[PolBenEarningsRangeCalcs] (
    [PolBenEarningsRangeCalcsId] INT             NOT NULL,
    [PolicyBenefitId]            INT             NULL,
    [EarningsEligibilityLow]     DECIMAL (10, 2) NOT NULL,
    [EarningsEligibilityHigh]    DECIMAL (10, 2) NOT NULL,
    [StartDate]                  DATETIME        NOT NULL,
    [EndDate]                    DATETIME        NOT NULL,
    [MinEarnings]                DECIMAL (10, 2) NOT NULL,
    [MaxEarnings]                DECIMAL (10, 2) NOT NULL,
    [PolicyMultiplier]           DECIMAL (10, 2) NOT NULL,
    [EarningsAllocation]         DECIMAL (10, 2) NOT NULL,
    [IsStatPolicyBenefit]        BIT             NOT NULL,
    [IsDeleted]                  BIT             NOT NULL,
    [CreatedBy]                  VARCHAR (50)    NOT NULL,
    [CreatedDate]                DATETIME        NOT NULL,
    [ModifiedBy]                 VARCHAR (50)    NOT NULL,
    [ModifiedDate]               DATETIME        NOT NULL,
    CONSTRAINT [PK__PolBenEarningsRangeCalcs] PRIMARY KEY CLUSTERED ([PolBenEarningsRangeCalcsId] ASC)
);

