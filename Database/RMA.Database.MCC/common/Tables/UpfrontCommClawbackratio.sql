CREATE TABLE [common].[UpfrontCommClawbackratio] (
    [ID]                    INT            IDENTITY (1, 1) NOT NULL,
    [MonthsSinceInception]  INT            NOT NULL,
    [PrimaryClawbackPerc]   DECIMAL (5, 4) NOT NULL,
    [SecondaryClawbackPerc] DECIMAL (5, 4) NOT NULL,
    PRIMARY KEY CLUSTERED ([ID] ASC)
);

