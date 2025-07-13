CREATE TABLE [quote].[QuoteDetails_V2] (
    [QuoteDetailId]              INT              IDENTITY (1, 1) NOT NULL,
    [QuoteId]                    INT              NOT NULL,
    [ProductOptionId]            INT              NOT NULL,
    [CategoryInsuredId]          INT              NOT NULL,
    [IndustryRate]               DECIMAL (38, 10) NULL,
    [AverageNumberOfEmployees]   INT              NOT NULL,
    [AverageEmployeeEarnings]    DECIMAL (38, 10) NULL,
    [Premium]                    DECIMAL (38, 10) NULL,
    [ParentChildSplitPercentage] DECIMAL (18, 4)  NULL,
    [LiveInAllowance]            DECIMAL (18, 4)  NULL,
    [IsDeleted]                  BIT              NOT NULL,
    [CreatedBy]                  VARCHAR (50)     NOT NULL,
    [CreatedDate]                DATETIME         NOT NULL,
    [ModifiedBy]                 VARCHAR (50)     NOT NULL,
    [ModifiedDate]               DATETIME         NOT NULL,
    CONSTRAINT [PK_QuoteDetails_V2] PRIMARY KEY CLUSTERED ([QuoteDetailId] ASC),
    CONSTRAINT [FK_QuoteDetails_V2_Quote_V2] FOREIGN KEY ([QuoteId]) REFERENCES [quote].[Quote_V2] ([QuoteId])
);

