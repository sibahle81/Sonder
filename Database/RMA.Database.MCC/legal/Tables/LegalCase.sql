CREATE TABLE [legal].[LegalCase] (
    [LegalCaseId]       INT          IDENTITY (1, 1) NOT NULL,
    [ClaimId]           INT          NOT NULL,
    [LegalCaseStatusId] INT          NOT NULL,
    [AssignedToUserId]  INT          NOT NULL,
    [IsDeleted]         BIT          CONSTRAINT [DF_LegalCase_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]         VARCHAR (50) NOT NULL,
    [CreatedDate]       DATETIME     CONSTRAINT [DF_LegalCase_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]        VARCHAR (50) NOT NULL,
    [ModifiedDate]      DATETIME     CONSTRAINT [DF_LegalCase_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK__legal_LegalCase] PRIMARY KEY CLUSTERED ([LegalCaseId] ASC),
    CONSTRAINT [FK_LegalCase_Claim] FOREIGN KEY ([ClaimId]) REFERENCES [claim].[Claim] ([ClaimId]),
    CONSTRAINT [FK_LegalCase_LegalCaseStatus] FOREIGN KEY ([LegalCaseStatusId]) REFERENCES [common].[LegalCaseStatus] ([Id]),
    CONSTRAINT [FK_LegalCase_User] FOREIGN KEY ([AssignedToUserId]) REFERENCES [security].[User] ([Id])
);




GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'LegalCaseStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'LegalCaseStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'LegalCaseStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'LegalCaseStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'LegalCaseStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'LegalCaseStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'LegalCaseId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'LegalCaseId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'LegalCaseId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'LegalCaseId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'LegalCaseId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'LegalCaseId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'ClaimId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'ClaimId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'ClaimId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'ClaimId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'ClaimId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'ClaimId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'AssignedToUserId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'AssignedToUserId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'AssignedToUserId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'AssignedToUserId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'AssignedToUserId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'legal', @level1type = N'TABLE', @level1name = N'LegalCase', @level2type = N'COLUMN', @level2name = N'AssignedToUserId';

