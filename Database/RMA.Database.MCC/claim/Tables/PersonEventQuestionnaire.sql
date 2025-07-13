CREATE TABLE [claim].[PersonEventQuestionnaire] (
    [PersonEventId]           INT                                                  NOT NULL,
    [IsTrainee]               BIT                                                  NULL,
    [TraineeLocation]         VARCHAR (100) MASKED WITH (FUNCTION = 'default()')   NULL,
    [AverageEarnings]         DECIMAL (18, 2) MASKED WITH (FUNCTION = 'default()') NULL,
    [BasicRate]               DECIMAL (18, 2) MASKED WITH (FUNCTION = 'default()') NULL,
    [AnnualBonus]             DECIMAL (18, 2) MASKED WITH (FUNCTION = 'default()') NULL,
    [SubTotal]                DECIMAL (18, 2) MASKED WITH (FUNCTION = 'default()') NULL,
    [employeeNumber]          VARCHAR (50) MASKED WITH (FUNCTION = 'default()')    NULL,
    [employeeLocation]        VARCHAR (50) MASKED WITH (FUNCTION = 'default()')    NULL,
    [EmployeeAverageEarnings] DECIMAL (18, 2) MASKED WITH (FUNCTION = 'default()') NULL,
    [EmployeeBasicRate]       DECIMAL (18, 2) MASKED WITH (FUNCTION = 'default()') NULL,
    [EmployeeAnnualBonus]     DECIMAL (18, 2) MASKED WITH (FUNCTION = 'default()') NULL,
    [FirstHousingQuarters]    DECIMAL (18, 2) MASKED WITH (FUNCTION = 'default()') NULL,
    [SecondAverageEarnings]   DECIMAL (18, 2) MASKED WITH (FUNCTION = 'default()') NULL,
    [SecondBasicRate]         DECIMAL (18, 2) MASKED WITH (FUNCTION = 'default()') NULL,
    [SecondAnnualBonus]       DECIMAL (18, 2) MASKED WITH (FUNCTION = 'default()') NULL,
    [SecondHousingQuarters]   DECIMAL (18, 2) MASKED WITH (FUNCTION = 'default()') NULL,
    [secondEmployeeNumber]    VARCHAR (50) MASKED WITH (FUNCTION = 'default()')    NULL,
    CONSTRAINT [PK_PersonEventQuestionnaire] PRIMARY KEY CLUSTERED ([PersonEventId] ASC),
    CONSTRAINT [FK_PersonEventQuestionnaire_PersonEvent] FOREIGN KEY ([PersonEventId]) REFERENCES [claim].[PersonEvent] ([PersonEventId])
);


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'secondEmployeeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'secondEmployeeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'secondEmployeeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'secondEmployeeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'secondEmployeeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'secondEmployeeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SecondHousingQuarters';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SecondHousingQuarters';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SecondHousingQuarters';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SecondHousingQuarters';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SecondHousingQuarters';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SecondHousingQuarters';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SecondAnnualBonus';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SecondAnnualBonus';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SecondAnnualBonus';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SecondAnnualBonus';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SecondAnnualBonus';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SecondAnnualBonus';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SecondBasicRate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SecondBasicRate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SecondBasicRate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SecondBasicRate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SecondBasicRate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SecondBasicRate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SecondAverageEarnings';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SecondAverageEarnings';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SecondAverageEarnings';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SecondAverageEarnings';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SecondAverageEarnings';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SecondAverageEarnings';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'FirstHousingQuarters';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'FirstHousingQuarters';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'FirstHousingQuarters';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'FirstHousingQuarters';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'FirstHousingQuarters';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'FirstHousingQuarters';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'EmployeeAnnualBonus';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'EmployeeAnnualBonus';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'EmployeeAnnualBonus';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'EmployeeAnnualBonus';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'EmployeeAnnualBonus';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'EmployeeAnnualBonus';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'EmployeeBasicRate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'EmployeeBasicRate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'EmployeeBasicRate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'EmployeeBasicRate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'EmployeeBasicRate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'EmployeeBasicRate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'EmployeeAverageEarnings';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'EmployeeAverageEarnings';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'EmployeeAverageEarnings';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'EmployeeAverageEarnings';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'EmployeeAverageEarnings';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'EmployeeAverageEarnings';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'employeeLocation';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'employeeLocation';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'employeeLocation';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'employeeLocation';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'employeeLocation';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'employeeLocation';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'employeeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'employeeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'employeeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'employeeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'employeeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'employeeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SubTotal';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SubTotal';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SubTotal';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SubTotal';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SubTotal';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'SubTotal';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'AnnualBonus';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'AnnualBonus';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'AnnualBonus';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'AnnualBonus';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'AnnualBonus';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'AnnualBonus';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'BasicRate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'BasicRate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'BasicRate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'BasicRate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'BasicRate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'BasicRate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'AverageEarnings';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'AverageEarnings';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'AverageEarnings';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'AverageEarnings';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'AverageEarnings';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'AverageEarnings';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'TraineeLocation';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'TraineeLocation';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'TraineeLocation';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'TraineeLocation';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'TraineeLocation';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'TraineeLocation';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'IsTrainee';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'IsTrainee';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'IsTrainee';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'IsTrainee';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'IsTrainee';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'IsTrainee';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'PersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'PersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'PersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'PersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'PersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventQuestionnaire', @level2type = N'COLUMN', @level2name = N'PersonEventId';

