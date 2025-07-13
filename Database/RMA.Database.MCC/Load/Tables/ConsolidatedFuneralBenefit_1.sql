CREATE TABLE [Load].[ConsolidatedFuneralBenefit] (
    [FileIdentifier]             UNIQUEIDENTIFIER NOT NULL,
    [ProductOptionName]          VARCHAR (128)    NOT NULL,
    [BenefitName]                VARCHAR (128)    NOT NULL,
    [ProductOptionId]            INT              NULL,
    [BenefitId]                  INT              NULL,
    [CoverMemberTypeId]          INT              NULL,
    [MaxPersonsPerProductOption] INT              DEFAULT ((999)) NULL,
    [MaxPersonsPerBenefit]       INT              DEFAULT ((999)) NULL,
    [MinEntryAge]                INT              DEFAULT ((0)) NULL,
    [MaxEntryAge]                INT              DEFAULT ((999)) NULL,
    [CapCover]                   DECIMAL (18, 2)  DEFAULT ((104000)) NULL,
    CONSTRAINT [PK__ConsolidatedFuneralBenefit] PRIMARY KEY CLUSTERED ([FileIdentifier] ASC, [ProductOptionName] ASC, [BenefitName] ASC)
);

