CREATE TABLE [dbo].[ImportBenefits] (
    [Id]                INT              IDENTITY (1, 1) NOT NULL,
    [RelationType]      VARCHAR (16)     NULL,
    [Product]           VARCHAR (64)     NULL,
    [ProductOption]     VARCHAR (64)     NULL,
    [BenefitName]       VARCHAR (100)    NULL,
    [OptionValue]       VARCHAR (8)      NULL,
    [MinimumAge]        INT              NULL,
    [MaximumAge]        INT              NULL,
    [CoverAmount]       MONEY            NULL,
    [BaseRate]          DECIMAL (18, 10) NULL,
    [CoverMemberTypeId] INT              NULL,
    [BenefitTypeId]     INT              NULL,
    [ProductOptionId]   INT              NULL,
    [BenefitId]         INT              NULL,
    [BenefitCode]       VARCHAR (32)     NULL,
    [FullBenefitName]   VARCHAR (100)    NULL,
    [AlreadyExists]     BIT              DEFAULT ((0)) NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

