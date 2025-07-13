CREATE TABLE [pension].[PensionAVFactor] (
    [PensionAVFactorId] INT             IDENTITY (1, 1) NOT NULL,
    [GenderId]          INT             NOT NULL,
    [Age]               INT             NOT NULL,
    [Value]             NUMERIC (18, 6) NOT NULL,
    [IsActive]          BIT             CONSTRAINT [DF_PensionAVFactor_IsActive] DEFAULT ((1)) NOT NULL,
    [IsDeleted]         BIT             CONSTRAINT [DF_PensionAVFactor_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]         VARCHAR (50)    NOT NULL,
    [CreatedDate]       DATETIME        CONSTRAINT [DF_PensionAVFactor_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]        VARCHAR (50)    NOT NULL,
    [ModifiedDate]      DATETIME        CONSTRAINT [DF_PensionAVFactor_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK__pension_PensionAVFactor] PRIMARY KEY CLUSTERED ([PensionAVFactorId] ASC),
    CONSTRAINT [FK_PensionAVFactor_Gender] FOREIGN KEY ([GenderId]) REFERENCES [common].[Gender] ([Id])
);




GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'Value';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'Value';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'Value';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'Value';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'Value';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'Value';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'Age';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'Age';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'Age';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'Age';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'Age';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'Age';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'GenderId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'GenderId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'GenderId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'GenderId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'GenderId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'GenderId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'PensionAVFactorId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'PensionAVFactorId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'PensionAVFactorId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'PensionAVFactorId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'PensionAVFactorId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionAVFactor', @level2type = N'COLUMN', @level2name = N'PensionAVFactorId';

