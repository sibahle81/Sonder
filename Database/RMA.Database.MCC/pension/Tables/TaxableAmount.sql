CREATE TABLE [pension].[TaxableAmount] (
    [Id]           INT          IDENTITY (1, 1) NOT NULL,
    [TaxYearId]      INT          NOT NULL,
    [AgeFrom]      INT NOT NULL,
    [AgeTo]    INT NULL,
    [Amount]     DECIMAL (18) NOT NULL,
    [IsActive]     BIT          NOT NULL,
    [IsDeleted]    BIT          NOT NULL,
    [CreatedBy]    VARCHAR (50) NOT NULL,
    [CreatedDate]  DATETIME     NOT NULL,
    [ModifiedBy]   VARCHAR (50) NOT NULL,
    [ModifiedDate] DATETIME     NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC), 
    CONSTRAINT [FK_TaxableAmount_TaxYear] FOREIGN KEY (TaxYearId) REFERENCES [pension].[TaxYear](Id)
);

