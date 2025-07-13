CREATE TABLE [debt].[DebtCase] (
    [DebtCaseId]       INT          IDENTITY (1, 1) NOT NULL,
    [ClaimId]          INT          NOT NULL,
    [DebtCaseStatusId] INT          NOT NULL,
    [AssignedToUserId] INT          NOT NULL,
    [IsDeleted]        BIT          CONSTRAINT [DF_DebtCase_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]        VARCHAR (50) NOT NULL,
    [CreatedDate]      DATETIME     CONSTRAINT [DF_DebtCase_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]       VARCHAR (50) NOT NULL,
    [ModifiedDate]     DATETIME     CONSTRAINT [DF_DebtCase_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK__debt_DebtCase] PRIMARY KEY CLUSTERED ([DebtCaseId] ASC),
    CONSTRAINT [FK_DebtCase_Claim] FOREIGN KEY ([ClaimId]) REFERENCES [claim].[Claim] ([ClaimId]),
    CONSTRAINT [FK_DebtCase_DebtCaseStatus] FOREIGN KEY ([DebtCaseStatusId]) REFERENCES [common].[DebtCaseStatus] ([Id]),
    CONSTRAINT [FK_DebtCase_User] FOREIGN KEY ([AssignedToUserId]) REFERENCES [security].[User] ([Id])
);




GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'DebtCaseStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'DebtCaseStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'DebtCaseStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'DebtCaseStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'DebtCaseStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'DebtCaseStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'DebtCaseId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'DebtCaseId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'DebtCaseId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'DebtCaseId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'DebtCaseId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'DebtCaseId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'ClaimId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'ClaimId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'ClaimId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'ClaimId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'ClaimId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'ClaimId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'AssignedToUserId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'AssignedToUserId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'AssignedToUserId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'AssignedToUserId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'AssignedToUserId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'debt', @level1type = N'TABLE', @level1name = N'DebtCase', @level2type = N'COLUMN', @level2name = N'AssignedToUserId';

