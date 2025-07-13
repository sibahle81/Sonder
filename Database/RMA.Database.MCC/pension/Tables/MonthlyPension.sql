CREATE TABLE [pension].[MonthlyPension] (
    [MonthlyPensionId] INT          IDENTITY (1, 1) NOT NULL,
    [TotalAmount]      DECIMAL (18) NOT NULL,
    [ReleasedAmount]   DECIMAL (18) NOT NULL,
    [PaymentDate]      DATETIME     NOT NULL,
    [BatchStatusId]    INT          NOT NULL,
    [IsActive]         BIT          NOT NULL,
    [IsDeleted]        BIT          NOT NULL,
    [CreatedBy]        VARCHAR (50) NOT NULL,
    [CreatedDate]      DATETIME     NOT NULL,
    [ModifiedBy]       VARCHAR (50) NOT NULL,
    [ModifiedDate]     DATETIME     NOT NULL,
    PRIMARY KEY CLUSTERED ([MonthlyPensionId] ASC),
    CONSTRAINT [FK_MonthlyPension_BatchStatus] FOREIGN KEY ([BatchStatusId]) REFERENCES [common].[BatchStatus] ([Id])
);

