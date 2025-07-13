CREATE TABLE [claim].[PersonEventNoiseDetail] (
    [PersonEventId]                     INT            NOT NULL,
    [NoiseLevel]                        DECIMAL (5, 2) NOT NULL,
    [ExposurePeriodShifts]              DECIMAL (5, 2) NOT NULL,
    [ExposurePeriodYears]               DECIMAL (5, 2) NOT NULL,
    [LastNoiseExposureDate]             DATE           NOT NULL,
    [IsStillWorkingInNoise]             BIT            NOT NULL,
    [FirstAudiogramDeate]               DATE           NULL,
    [ShiftDatePriorToTest]              DATE           NOT NULL,
    [IsNoNoisePriorToTest]              BIT            NOT NULL,
    [IsPreviousCompensationForDeafness] BIT            NOT NULL,
    CONSTRAINT [PK_PersonEventNoiseDetail] PRIMARY KEY CLUSTERED ([PersonEventId] ASC),
    CONSTRAINT [FK_PersonEventNoiseDetail_PersonEvent] FOREIGN KEY ([PersonEventId]) REFERENCES [claim].[PersonEvent] ([PersonEventId])
);


GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'ShiftDatePriorToTest';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'ShiftDatePriorToTest';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'ShiftDatePriorToTest';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'ShiftDatePriorToTest';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'ShiftDatePriorToTest';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'ShiftDatePriorToTest';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'PersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'PersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'PersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'PersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'PersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'PersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'NoiseLevel';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'NoiseLevel';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'NoiseLevel';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'NoiseLevel';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'NoiseLevel';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'NoiseLevel';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'LastNoiseExposureDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'LastNoiseExposureDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'LastNoiseExposureDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'LastNoiseExposureDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'LastNoiseExposureDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'LastNoiseExposureDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'IsStillWorkingInNoise';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'IsStillWorkingInNoise';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'IsStillWorkingInNoise';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'IsStillWorkingInNoise';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'IsStillWorkingInNoise';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'IsStillWorkingInNoise';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'IsPreviousCompensationForDeafness';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'IsPreviousCompensationForDeafness';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'IsPreviousCompensationForDeafness';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'IsPreviousCompensationForDeafness';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'IsPreviousCompensationForDeafness';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'IsPreviousCompensationForDeafness';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'IsNoNoisePriorToTest';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'IsNoNoisePriorToTest';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'IsNoNoisePriorToTest';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'IsNoNoisePriorToTest';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'IsNoNoisePriorToTest';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'IsNoNoisePriorToTest';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'FirstAudiogramDeate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'FirstAudiogramDeate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'FirstAudiogramDeate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'FirstAudiogramDeate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'FirstAudiogramDeate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'FirstAudiogramDeate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'ExposurePeriodYears';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'ExposurePeriodYears';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'ExposurePeriodYears';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'ExposurePeriodYears';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'ExposurePeriodYears';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'ExposurePeriodYears';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'ExposurePeriodShifts';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'ExposurePeriodShifts';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'ExposurePeriodShifts';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'ExposurePeriodShifts';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'ExposurePeriodShifts';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventNoiseDetail', @level2type = N'COLUMN', @level2name = N'ExposurePeriodShifts';

