CREATE TABLE [client].[IndustryClassRenewal] (
    [IndustryClassRenewalId]           INT          IDENTITY (1, 1) NOT NULL,
    [Description]                      VARCHAR (50) NOT NULL,
    [IndustryClassId]                  INT          NOT NULL,
    [RenewalPeriodStartMonth]          INT          NOT NULL,
    [RenewalPeriodStartDayOfMonth]     INT          NOT NULL,
    [RenewalPeriodEndMonth]            INT          NOT NULL,
    [RenewalPeriodEndDayOfMonth]       INT          NOT NULL,
    [DeclarationPeriodStartMonth]      INT          NOT NULL,
    [DeclarationPeriodStartDayOfMonth] INT          NOT NULL,
    [DeclarationPeriodEndMonth]        INT          NOT NULL,
    [DeclarationPeriodEndDayOfMonth]   INT          NOT NULL,
    PRIMARY KEY CLUSTERED ([IndustryClassRenewalId] ASC)
);

