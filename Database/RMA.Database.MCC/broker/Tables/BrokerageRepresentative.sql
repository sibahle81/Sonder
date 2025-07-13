CREATE TABLE [broker].[BrokerageRepresentative] (
    [Id]               INT          IDENTITY (1, 1) NOT NULL,
    [BrokerageId]      INT          NOT NULL,
    [RepresentativeId] INT          NOT NULL,
    [RepRoleId]        INT          NOT NULL,
    [StartDate]        DATE         NULL,
    [EndDate]          DATE         NULL,
    [IsDeleted]        BIT          NOT NULL,
    [CreatedBy]        VARCHAR (50) NOT NULL,
    [CreatedDate]      DATETIME     NOT NULL,
    [ModifiedBy]       VARCHAR (50) NOT NULL,
    [ModifiedDate]     DATETIME     NOT NULL,
    [JuristicRepId]    INT          NULL,
    CONSTRAINT [PK__BrokerageAgent] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_BrokerageAgent_Brokerage] FOREIGN KEY ([BrokerageId]) REFERENCES [broker].[Brokerage] ([Id]),
    CONSTRAINT [FK_BrokerageRepresentative_JuristicRepresentative] FOREIGN KEY ([JuristicRepId]) REFERENCES [broker].[Representative] ([Id]),
    CONSTRAINT [FK_BrokerageRepresentative_Representative] FOREIGN KEY ([RepresentativeId]) REFERENCES [broker].[Representative] ([Id])
);


GO

GO

GO

GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'RepRoleId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'RepRoleId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'RepRoleId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'RepRoleId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'RepRoleId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'RepRoleId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'RepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'RepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'RepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'RepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'RepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'RepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'JuristicRepId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'JuristicRepId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'JuristicRepId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'JuristicRepId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'JuristicRepId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'JuristicRepId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'BrokerageId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'BrokerageId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'BrokerageId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'BrokerageId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'BrokerageId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageRepresentative', @level2type = N'COLUMN', @level2name = N'BrokerageId';

