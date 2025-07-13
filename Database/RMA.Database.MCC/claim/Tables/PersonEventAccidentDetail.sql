CREATE TABLE [claim].[PersonEventAccidentDetail] (
    [PersonEventId]                INT                                               NOT NULL,
    [IsOccurAtNormalWorkplace]     BIT                                               NOT NULL,
    [IsOccurPerformingScopeofDuty] BIT                                               NULL,
    [IsRoadAccident]               BIT                                               NOT NULL,
    [IsOnBusinessTravel]           BIT                                               NOT NULL,
    [IsTrainingTravel]             BIT                                               NOT NULL,
    [IsTravelToFromWork]           BIT                                               NOT NULL,
    [IsOnCallout]                  BIT                                               NOT NULL,
    [IsOnStandby]                  BIT                                               NOT NULL,
    [IsPublicRoad]                 BIT                                               NOT NULL,
    [IsPrivateRoad]                BIT                                               NOT NULL,
    [VehicleMake]                  VARCHAR (50)                                      NULL,
    [VehicleRegNo]                 VARCHAR (50) MASKED WITH (FUNCTION = 'default()') NULL,
    [ThirdPartyVehicleMake]        VARCHAR (50)                                      NULL,
    [ThirdPartyVahicleRegNo]       VARCHAR (50) MASKED WITH (FUNCTION = 'default()') NULL,
    [PoliceReferenceNo]            VARCHAR (50)                                      NULL,
    [PoliceStationName]            VARCHAR (50)                                      NULL,
    CONSTRAINT [PK_PersonEventAccidentDetail] PRIMARY KEY CLUSTERED ([PersonEventId] ASC),
    CONSTRAINT [FK_PersonEventAccidentDetail_PersonEvent] FOREIGN KEY ([PersonEventId]) REFERENCES [claim].[PersonEvent] ([PersonEventId])
);




GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'VehicleRegNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'VehicleRegNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'VehicleRegNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'VehicleRegNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'VehicleRegNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'VehicleRegNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'VehicleMake';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'VehicleMake';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'VehicleMake';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'VehicleMake';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'VehicleMake';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'VehicleMake';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'ThirdPartyVehicleMake';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'ThirdPartyVehicleMake';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'ThirdPartyVehicleMake';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'ThirdPartyVehicleMake';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'ThirdPartyVehicleMake';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'ThirdPartyVehicleMake';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'ThirdPartyVahicleRegNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'ThirdPartyVahicleRegNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'ThirdPartyVahicleRegNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'ThirdPartyVahicleRegNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'ThirdPartyVahicleRegNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'ThirdPartyVahicleRegNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'PoliceStationName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'PoliceStationName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'PoliceStationName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'PoliceStationName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'PoliceStationName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'PoliceStationName';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'PoliceReferenceNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'PoliceReferenceNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'PoliceReferenceNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'PoliceReferenceNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'PoliceReferenceNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'PoliceReferenceNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'PersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'PersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'PersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'PersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'PersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'PersonEventId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsTravelToFromWork';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsTravelToFromWork';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsTravelToFromWork';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsTravelToFromWork';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsTravelToFromWork';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsTravelToFromWork';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsTrainingTravel';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsTrainingTravel';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsTrainingTravel';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsTrainingTravel';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsTrainingTravel';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsTrainingTravel';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsRoadAccident';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsRoadAccident';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsRoadAccident';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsRoadAccident';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsRoadAccident';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsRoadAccident';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsPublicRoad';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsPublicRoad';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsPublicRoad';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsPublicRoad';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsPublicRoad';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsPublicRoad';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsPrivateRoad';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsPrivateRoad';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsPrivateRoad';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsPrivateRoad';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsPrivateRoad';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsPrivateRoad';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOnStandby';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOnStandby';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOnStandby';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOnStandby';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOnStandby';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOnStandby';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOnCallout';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOnCallout';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOnCallout';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOnCallout';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOnCallout';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOnCallout';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOnBusinessTravel';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOnBusinessTravel';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOnBusinessTravel';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOnBusinessTravel';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOnBusinessTravel';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOnBusinessTravel';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOccurPerformingScopeofDuty';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOccurPerformingScopeofDuty';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOccurPerformingScopeofDuty';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOccurPerformingScopeofDuty';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOccurPerformingScopeofDuty';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOccurPerformingScopeofDuty';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOccurAtNormalWorkplace';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOccurAtNormalWorkplace';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOccurAtNormalWorkplace';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOccurAtNormalWorkplace';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOccurAtNormalWorkplace';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'PersonEventAccidentDetail', @level2type = N'COLUMN', @level2name = N'IsOccurAtNormalWorkplace';

