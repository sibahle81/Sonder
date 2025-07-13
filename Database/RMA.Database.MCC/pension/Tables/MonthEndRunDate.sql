CREATE TABLE [pension].[MonthEndRunDate] (
    [MonthEndRunDateId]             INT          IDENTITY (1, 1) NOT NULL,
    [AuthorizationCloseOfDate]      DATETIME     NOT NULL,
    [MonthEndCloseOfDate]           DATETIME     NOT NULL,
    [PaymentDate]                   DATETIME     NOT NULL,
    [monthEndBalanceAndReleaseDate] DATETIME     NOT NULL,
    [pacsCreateDate]                DATETIME     NOT NULL,
    [pacsStrikeDate]                DATETIME     NOT NULL,
    [IsActive]                      BIT          NOT NULL,
    [IsDeleted]                     BIT          NOT NULL,
    [CreatedBy]                     VARCHAR (50) NOT NULL,
    [CreatedDate]                   DATETIME     NOT NULL,
    [ModifiedBy]                    VARCHAR (50) NOT NULL,
    [ModifiedDate]                  DATETIME     NOT NULL,
    [MonthId]                       INT          NOT NULL,
    [MonthEndRunStatusId]           INT          NOT NULL,
    [Year]                          INT          NOT NULL,
    CONSTRAINT [PK__pension_MonthEndRunDate] PRIMARY KEY CLUSTERED ([MonthEndRunDateId] ASC),
    CONSTRAINT [FK_MonthEndRunDate_Month] FOREIGN KEY ([MonthId]) REFERENCES [common].[Month] ([Id]),
    CONSTRAINT [FK_MonthEndRunDate_Status] FOREIGN KEY ([MonthEndRunStatusId]) REFERENCES [common].[MonthEndRunStatus] ([Id])
);

