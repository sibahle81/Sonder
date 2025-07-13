CREATE TABLE [policy].[PolicyBenefit] (
    [PolicyId]  INT NOT NULL,
    [BenifitId] INT NOT NULL,
    CONSTRAINT [PK__PolicyBe__2E1339A49AE88601] PRIMARY KEY CLUSTERED ([PolicyId] ASC, [BenifitId] ASC),
    CONSTRAINT [FK_PolicyBenefit_Benefit] FOREIGN KEY ([BenifitId]) REFERENCES [product].[Benefit] ([Id]),
    CONSTRAINT [FK_PolicyBenefit_Policy] FOREIGN KEY ([PolicyId]) REFERENCES [policy].[Policy] ([PolicyId])
);


GO

GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBenefit', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBenefit', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBenefit', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBenefit', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBenefit', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBenefit', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBenefit', @level2type = N'COLUMN', @level2name = N'BenifitId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBenefit', @level2type = N'COLUMN', @level2name = N'BenifitId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBenefit', @level2type = N'COLUMN', @level2name = N'BenifitId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBenefit', @level2type = N'COLUMN', @level2name = N'BenifitId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBenefit', @level2type = N'COLUMN', @level2name = N'BenifitId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyBenefit', @level2type = N'COLUMN', @level2name = N'BenifitId';

