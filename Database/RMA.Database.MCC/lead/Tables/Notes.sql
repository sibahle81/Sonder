CREATE TABLE [lead].[Notes] (
    [NoteId]       INT            IDENTITY (1, 1) NOT NULL,
    [LeadId]       INT            NOT NULL,
    [Note]         VARCHAR (1000) NOT NULL,
    [IsDeleted]    BIT            CONSTRAINT [DF_Notes_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]    VARCHAR (50)   NOT NULL,
    [CreatedDate]  DATETIME       CONSTRAINT [DF_Notes_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]   VARCHAR (50)   NOT NULL,
    [ModifiedDate] DATETIME       CONSTRAINT [DF_Notes_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_lead.Notes] PRIMARY KEY CLUSTERED ([NoteId] ASC),
    CONSTRAINT [FK_Notes_Lead] FOREIGN KEY ([LeadId]) REFERENCES [lead].[Lead] ([LeadId])
);


GO


GO


GO


GO


GO


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'NoteId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'NoteId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'NoteId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'NoteId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'NoteId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'NoteId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'Note';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'Note';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'Note';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'Note';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'Note';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'Note';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Notes', @level2type = N'COLUMN', @level2name = N'CreatedBy';

