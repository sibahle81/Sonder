CREATE TABLE [policy].[PolicyBroker] (
    [PolicyBrokerId] INT          IDENTITY (1, 1) NOT NULL,
    [PolicyId]       INT          NOT NULL,
    [RepId]          INT          NOT NULL,
    [BrokerageId]    INT          NOT NULL,
    [JuristicRepId]  INT          NULL,
    [EffectiveDate]  DATETIME     NOT NULL,
    [CreatedBy]      VARCHAR (50) NOT NULL,
    [CreatedDate]    DATETIME     NOT NULL,
    [ModifiedBy]     VARCHAR (50) NOT NULL,
    [ModifiedDate]   DATETIME     NOT NULL,
    [IsDeleted]      BIT          NOT NULL,
    CONSTRAINT [PK_PolicyBroker_1] PRIMARY KEY CLUSTERED ([PolicyBrokerId] ASC),
    CONSTRAINT [FK_PolicyBroker_Brokerage] FOREIGN KEY ([BrokerageId]) REFERENCES [broker].[Brokerage] ([Id]),
    CONSTRAINT [FK_PolicyBroker_Policy] FOREIGN KEY ([PolicyId]) REFERENCES [policy].[Policy] ([PolicyId]),
    CONSTRAINT [FK_PolicyBroker_Representative] FOREIGN KEY ([RepId]) REFERENCES [broker].[Representative] ([Id]),
    CONSTRAINT [FK_PolicyBroker_Representative1] FOREIGN KEY ([JuristicRepId]) REFERENCES [broker].[Representative] ([Id])
);


GO

GO

GO

GO

GO

GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'RepId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'RepId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'RepId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'RepId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'RepId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'RepId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'PolicyBrokerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'PolicyBrokerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'PolicyBrokerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'PolicyBrokerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'PolicyBrokerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'PolicyBrokerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'JuristicRepId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'JuristicRepId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'JuristicRepId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'JuristicRepId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'JuristicRepId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'JuristicRepId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'EffectiveDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'EffectiveDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'EffectiveDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'EffectiveDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'EffectiveDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'EffectiveDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'BrokerageId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'BrokerageId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'BrokerageId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'BrokerageId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'BrokerageId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBroker', @level2type = N'COLUMN', @level2name = N'BrokerageId';

