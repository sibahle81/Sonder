CREATE TABLE [commission].[CommValidation] (
    [ID]                     INT          IDENTITY (1, 1) NOT NULL,
    [CommissionTypeID]       INT          NOT NULL,
    [ValidationProviderName] VARCHAR (20) NOT NULL,
    [Reference]              VARCHAR (20) NOT NULL,
    [PolicyNumber]           VARCHAR (15) NOT NULL,
    [Result]                 VARCHAR (30) NOT NULL,
    PRIMARY KEY CLUSTERED ([ID] ASC)
);


GO
CREATE NONCLUSTERED INDEX [IDX_CommValidation_PolicyNumber]
    ON [commission].[CommValidation]([PolicyNumber] ASC);

