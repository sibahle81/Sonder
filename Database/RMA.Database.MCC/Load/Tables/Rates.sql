CREATE TABLE [Load].[Rates] (
    [RatesId]      INT              IDENTITY (1, 1) NOT NULL,
    [Product]      VARCHAR (255)    NOT NULL,
    [MemberNo]     VARCHAR (50)     NOT NULL,
    [Category]     INT              NOT NULL,
    [Rate]         DECIMAL (15, 10) NOT NULL,
    [RatingYear]   INT              NOT NULL,
    [IsDeleted]    BIT              NOT NULL,
    [CreatedBy]    VARCHAR (50)     NOT NULL,
    [CreatedDate]  DATETIME         NOT NULL,
    [ModifiedBy]   VARCHAR (50)     NOT NULL,
    [ModifiedDate] DATETIME         NOT NULL,
    CONSTRAINT [PK_Rates] PRIMARY KEY CLUSTERED ([RatesId] ASC)
);

