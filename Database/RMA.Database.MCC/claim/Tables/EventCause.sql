CREATE TABLE [claim].[EventCause] (
    [EventCauseID]         INT           IDENTITY (1000, 1) NOT NULL,
    [Name]                 VARCHAR (50)  NOT NULL,
    [Code]                 VARCHAR (12)  NULL,
    [Description]          VARCHAR (250) NULL,
    [EventTypeID]          INT           NOT NULL,
    [IsThirdPartyInvolved] BIT           NOT NULL,
    [ICD10Codes]           VARCHAR (50)  NULL,
    [DiseaseTypeID]        INT           NULL,
    [AccidentTypeID]       INT           NULL,
    [EventActionID]        INT           NULL,
    [EventActivityID]      INT           NULL,
    [EventAgentID]         INT           NULL,
    [IsNeedEarnings]       BIT           NULL,
    [IsActive]             BIT           NOT NULL,
    [IsDeleted]            BIT           CONSTRAINT [DF_EventCause_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]            VARCHAR (50)  NOT NULL,
    [CreatedDate]          DATETIME      NOT NULL,
    [ModifiedBy]           VARCHAR (30)  NOT NULL,
    [ModifiedDate]         DATETIME      NOT NULL,
    CONSTRAINT [PK__EventCau__2425D1402ECF140A] PRIMARY KEY CLUSTERED ([EventCauseID] ASC)
);




GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'IsThirdPartyInvolved';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'IsThirdPartyInvolved';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'IsThirdPartyInvolved';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'IsThirdPartyInvolved';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'IsThirdPartyInvolved';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'IsThirdPartyInvolved';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'IsNeedEarnings';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'IsNeedEarnings';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'IsNeedEarnings';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'IsNeedEarnings';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'IsNeedEarnings';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'IsNeedEarnings';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'ICD10Codes';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'ICD10Codes';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'ICD10Codes';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'ICD10Codes';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'ICD10Codes';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'ICD10Codes';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventTypeID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventTypeID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventTypeID';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventTypeID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventTypeID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventTypeID';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventCauseID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventCauseID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventCauseID';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventCauseID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventCauseID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventCauseID';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventAgentID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventAgentID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventAgentID';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventAgentID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventAgentID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventAgentID';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventActivityID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventActivityID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventActivityID';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventActivityID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventActivityID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventActivityID';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventActionID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventActionID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventActionID';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventActionID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventActionID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'EventActionID';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'DiseaseTypeID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'DiseaseTypeID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'DiseaseTypeID';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'DiseaseTypeID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'DiseaseTypeID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'DiseaseTypeID';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'AccidentTypeID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'AccidentTypeID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'AccidentTypeID';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'AccidentTypeID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'AccidentTypeID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'EventCause', @level2type = N'COLUMN', @level2name = N'AccidentTypeID';

