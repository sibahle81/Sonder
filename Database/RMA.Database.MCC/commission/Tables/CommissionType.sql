CREATE TABLE [commission].[CommissionType] (
    [id]               INT          IDENTITY (1, 1) NOT NULL,
    [CommissionTypeID] INT          NOT NULL,
    [CommissionType]   VARCHAR (50) NOT NULL,
    [SP_NAME]          VARCHAR (50) NOT NULL,
    [createddt]        DATETIME     NOT NULL,
    [validfrom]        DATE         NOT NULL,
    [validto]          DATE         NULL,
    PRIMARY KEY CLUSTERED ([id] ASC)
);


GO
CREATE NONCLUSTERED INDEX [IDX_CommissionType_CommissionTypeID]
    ON [commission].[CommissionType]([CommissionTypeID] ASC);

