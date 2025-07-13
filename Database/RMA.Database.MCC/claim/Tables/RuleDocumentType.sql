CREATE TABLE [claim].[RuleDocumentType] (
    [Id]             INT IDENTITY (1, 1) NOT NULL,
    [DocumentRuleId] INT NOT NULL,
    [DocumentTypeId] INT NOT NULL,
    [isRequired]     BIT NOT NULL,
    CONSTRAINT [PK_RuleDocumentType] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'RuleDocumentType', @level2type = N'COLUMN', @level2name = N'isRequired';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'RuleDocumentType', @level2type = N'COLUMN', @level2name = N'isRequired';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'RuleDocumentType', @level2type = N'COLUMN', @level2name = N'isRequired';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'RuleDocumentType', @level2type = N'COLUMN', @level2name = N'isRequired';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'RuleDocumentType', @level2type = N'COLUMN', @level2name = N'isRequired';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'RuleDocumentType', @level2type = N'COLUMN', @level2name = N'isRequired';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'RuleDocumentType', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'RuleDocumentType', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'RuleDocumentType', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'RuleDocumentType', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'RuleDocumentType', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'RuleDocumentType', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'RuleDocumentType', @level2type = N'COLUMN', @level2name = N'DocumentTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'RuleDocumentType', @level2type = N'COLUMN', @level2name = N'DocumentTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'RuleDocumentType', @level2type = N'COLUMN', @level2name = N'DocumentTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'RuleDocumentType', @level2type = N'COLUMN', @level2name = N'DocumentTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'RuleDocumentType', @level2type = N'COLUMN', @level2name = N'DocumentTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'RuleDocumentType', @level2type = N'COLUMN', @level2name = N'DocumentTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'RuleDocumentType', @level2type = N'COLUMN', @level2name = N'DocumentRuleId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'RuleDocumentType', @level2type = N'COLUMN', @level2name = N'DocumentRuleId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'RuleDocumentType', @level2type = N'COLUMN', @level2name = N'DocumentRuleId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'RuleDocumentType', @level2type = N'COLUMN', @level2name = N'DocumentRuleId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'RuleDocumentType', @level2type = N'COLUMN', @level2name = N'DocumentRuleId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'RuleDocumentType', @level2type = N'COLUMN', @level2name = N'DocumentRuleId';

