CREATE TABLE [broker].[RepQualification] (
    [Id]               INT           IDENTITY (1, 1) NOT NULL,
    [RepresentativeId] INT           NOT NULL,
    [Code]             INT           NULL,
    [Description]      VARCHAR (255) NULL,
    [YearObtained]     INT           NULL,
    [IsDeleted]        BIT           NOT NULL,
    [CreatedBy]        VARCHAR (50)  NOT NULL,
    [CreatedDate]      DATETIME      NOT NULL,
    [ModifiedBy]       VARCHAR (50)  NOT NULL,
    [ModifiedDate]     DATETIME      NOT NULL,
    CONSTRAINT [PK_RepQualification] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_RepQualification_Representative] FOREIGN KEY ([RepresentativeId]) REFERENCES [broker].[Representative] ([Id])
);


GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'YearObtained';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'YearObtained';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'YearObtained';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'YearObtained';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'YearObtained';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'YearObtained';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'RepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'RepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'RepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'RepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'RepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'RepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'RepQualification', @level2type = N'COLUMN', @level2name = N'Code';

