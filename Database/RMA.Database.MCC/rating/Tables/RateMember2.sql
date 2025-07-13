CREATE TABLE [rating].[RateMember2] (
    [RefNo]                   VARCHAR (50)     NULL,
    [CompanyName]             VARCHAR (100)    NULL,
    [Industry]                VARCHAR (50)     NULL,
    [IndustryGroup]           VARCHAR (6)      NOT NULL,
    [EmpCat]                  VARCHAR (50)     NULL,
    [IndRate]                 NUMERIC (25, 11) NOT NULL,
    [PremRate]                NUMERIC (25, 11) NOT NULL,
    [GPLimited]               NUMERIC (25, 11) NOT NULL,
    [FinalRate]               NUMERIC (25, 11) NOT NULL,
    [DiscountOrLoading]       NUMERIC (25, 11) NULL,
    [DiscountOrLoadingStatus] VARCHAR (9)      NOT NULL,
    [RatingYear]              INT              NOT NULL,
    [LoadDate]                DATETIME         NOT NULL,
    [Product]                 VARCHAR (1000)   NULL
);

