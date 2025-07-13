CREATE TABLE [security].[UserContact] (
    [UserContactId] INT                                               IDENTITY (1, 1) NOT NULL,
    [UserId]        INT                                               NOT NULL,
    [CellPhoneNo]   VARCHAR (20) MASKED WITH (FUNCTION = 'default()') NULL,
    [TelephoneNo]   VARCHAR (20) MASKED WITH (FUNCTION = 'default()') NULL,
    [Email]         VARCHAR (50) MASKED WITH (FUNCTION = 'default()') NULL,
    [IsActive]      BIT                                               DEFAULT ((1)) NOT NULL,
    [IsDeleted]     BIT                                               DEFAULT ((0)) NOT NULL,
    [CreatedBy]     VARCHAR (50)                                      NOT NULL,
    [CreatedDate]   DATETIME                                          DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]    VARCHAR (50)                                      NOT NULL,
    [ModifiedDate]  DATETIME                                          DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_UserContact] PRIMARY KEY CLUSTERED ([UserContactId] ASC),
    CONSTRAINT [FK_UserContact_User] FOREIGN KEY ([UserId]) REFERENCES [security].[User] ([Id])
);


GO


GO


GO


GO


GO


GO


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'UserId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'UserId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'UserId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'UserId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'UserId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'UserId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'UserContactId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'UserContactId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'UserContactId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'UserContactId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'UserContactId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'UserContactId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'TelephoneNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'TelephoneNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'TelephoneNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'TelephoneNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'TelephoneNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'TelephoneNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'Email';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'Email';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'Email';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'Email';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'Email';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'Email';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'CellPhoneNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'CellPhoneNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'CellPhoneNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'CellPhoneNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'CellPhoneNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserContact', @level2type = N'COLUMN', @level2name = N'CellPhoneNo';

