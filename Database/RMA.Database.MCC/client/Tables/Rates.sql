CREATE TABLE [client].[Rates] (
    [RatesId]                 INT              IDENTITY (1, 1) NOT NULL,
    [Product]                 VARCHAR (50)     NULL,
    [MemberNo]                VARCHAR (10)     NULL,
    [Category]                INT              NOT NULL,
    [BenefitSet]              VARCHAR (40)     NULL,
    [RateType]                VARCHAR (10)     NULL,
    [Rate]                    DECIMAL (15, 10) NULL,
    [StartDate]               DATETIME         NULL,
    [EndDate]                 DATETIME         NULL,
    [RefNo]                   VARCHAR (50)     NULL,
    [CompanyName]             VARCHAR (100)    NULL,
    [Industry]                VARCHAR (200)    NULL,
    [IndustryGroup]           VARCHAR (50)     NULL,
    [IndRate]                 DECIMAL (15, 10) NULL,
    [PremRate]                DECIMAL (15, 10) NULL,
    [GPLimited]               DECIMAL (15, 10) NULL,
    [FinalRate]               DECIMAL (15, 10) NULL,
    [DiscountOrLoading]       DECIMAL (15, 10) NULL,
    [DiscountOrLoadingStatus] VARCHAR (50)     NULL,
    [RatingYear]              INT              NULL,
    [LoadDate]                DATETIME         NULL,
    [IsDeleted]               BIT              NOT NULL,
    [CreatedBy]               VARCHAR (50)     NOT NULL,
    [CreatedDate]             DATETIME         NOT NULL,
    [ModifiedBy]              VARCHAR (50)     NOT NULL,
    [ModifiedDate]            DATETIME         NOT NULL,
    CONSTRAINT [PK_Client_Rates_RatesId] PRIMARY KEY CLUSTERED ([RatesId] ASC) WITH (FILLFACTOR = 95)
);



