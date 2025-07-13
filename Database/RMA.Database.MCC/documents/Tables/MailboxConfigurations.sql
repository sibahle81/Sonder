--------------------------------------------------------------------------------
-- Script: Create DocumentSystemName lookup table (if not exists) and seed enum
--------------------------------------------------------------------------------
IF NOT EXISTS (
    SELECT 1
      FROM sys.objects
     WHERE object_id = OBJECT_ID(N'[documents].[DocumentSystemName]')
       AND type = N'U'
)
BEGIN
    CREATE TABLE [documents].[DocumentSystemName] (
        [Id]          INT            NOT NULL CONSTRAINT PK_DocumentSystemName PRIMARY KEY,
        [Name]        NVARCHAR(100)  NOT NULL CONSTRAINT UQ_DocumentSystemName_Name UNIQUE,
        [DisplayName] NVARCHAR(100)  NOT NULL
    );
END;

MERGE INTO [documents].[DocumentSystemName] AS Target
USING (VALUES
    (1,  'CommonManager',         'CommonManager'),
    (2,  'ProductManager',        'ProductManager'),
    (3,  'LeadManager',           'LeadManager'),
    (4,  'QuoteManager',          'QuoteManager'),
    (5,  'MemberManager',         'MemberManager'),
    (6,  'PolicyManager',         'PolicyManager'),
    (7,  'ClaimManager',          'ClaimManager'),
    (8,  'BillingManager',        'BillingManager'),
    (9,  'PensCareManager',       'PensCareManager'),
    (10, 'ChildExtensionManager', 'ChildExtensionManager'),
    (11, 'WizardManager',         'WizardManager'),
    (12, 'LegalCareManager',      'LegalCareManager'),
    (13, 'DebtCareManager',       'DebtCareManager'),
    (14, 'MediCareManager',       'MediCareManager'),
    (15, 'RolePlayerDocuments',   'RolePlayerDocuments')
) AS Source (Id, Name, DisplayName)
ON Target.Id = Source.Id
WHEN MATCHED THEN
    UPDATE SET Name = Source.Name,
               DisplayName = Source.DisplayName
WHEN NOT MATCHED BY TARGET THEN
    INSERT (Id, Name, DisplayName)
    VALUES (Source.Id, Source.Name, Source.DisplayName)
;

--------------------------------------------------------------------------------
-- Script: Create MailboxConfiguration table (if not exists)
--------------------------------------------------------------------------------
IF NOT EXISTS (
    SELECT 1
      FROM sys.objects
     WHERE object_id = OBJECT_ID(N'[documents].[MailboxConfiguration]')
       AND type = N'U'
)
BEGIN
    CREATE TABLE [documents].[MailboxConfiguration] (
        -- Surrogate primary key
        [Id]                    INT             IDENTITY(1,1) NOT NULL
                                   CONSTRAINT PK_MailboxConfiguration PRIMARY KEY CLUSTERED,

        -- Audit fields
        [IsActive]              BIT             NOT NULL
                                   CONSTRAINT DF_MailboxConfig_IsActive DEFAULT (1),
        [IsDeleted]             BIT             NOT NULL
                                   CONSTRAINT DF_MailboxConfig_IsDeleted DEFAULT (0),
        [CreatedBy]             NVARCHAR(256)   NOT NULL,
        [CreatedDate]           DATETIME2       NOT NULL
                                   CONSTRAINT DF_MailboxConfig_CreatedDate DEFAULT (SYSUTCDATETIME()),
        [ModifiedBy]            NVARCHAR(256)   NULL,
        [ModifiedDate]          DATETIME2       NOT NULL
                                   CONSTRAINT DF_MailboxConfig_ModifiedDate DEFAULT (SYSUTCDATETIME()),

        -- Business fields
        [MailboxAddress]        NVARCHAR(256)   NOT NULL,
        [DocumentSystemNameId]  INT             NOT NULL
                                   CONSTRAINT FK_MailboxConfig_SystemName
                                       FOREIGN KEY REFERENCES documents.DocumentSystemName (Id),

        -- Enforce natural uniqueness
        CONSTRAINT UQ_MailboxConfig_Address_System
            UNIQUE (MailboxAddress, DocumentSystemNameId)
    );

    -- Index on the foreign key for faster lookups
    CREATE NONCLUSTERED INDEX IX_MailboxConfig_SystemNameId
        ON [documents].[MailboxConfiguration] (DocumentSystemNameId);
END;
