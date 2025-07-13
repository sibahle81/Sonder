CREATE TABLE [commission].[CommissionConfig] (
    [ID]               INT           IDENTITY (1, 1) NOT NULL,
    [ConfigID]         INT           NOT NULL,
    [CommissionTypeID] INT           NOT NULL,
    [BrokerID]         VARCHAR (20)  NOT NULL,
    [ProductIDs]       VARCHAR (100) NULL,
    PRIMARY KEY CLUSTERED ([ID] ASC)
);


GO
CREATE NONCLUSTERED INDEX [IDX_CommConfig]
    ON [commission].[CommissionConfig]([ConfigID] ASC);

