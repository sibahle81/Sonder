CREATE TABLE [medical].[Contacts_Temp] (
    [ContactsID]      INT                                                IDENTITY (1, 1) NOT NULL,
    [PhoneTypeID]     INT                                                NOT NULL,
    [ContactPersonID] INT                                                NOT NULL,
    [AreaCode]        VARCHAR (20)                                       NULL,
    [LastChangedBy]   VARCHAR (30)                                       NULL,
    [LastChangedDate] DATETIME                                           NULL,
    [PersonOnNumber]  VARCHAR (100)                                      NULL,
    [Contact]         VARCHAR (512) MASKED WITH (FUNCTION = 'default()') NULL,
    [IsActive]        BIT                                                NOT NULL,
    [IsDeleted]       BIT                                                NOT NULL,
    [CreatedBy]       VARCHAR (50)                                       NOT NULL,
    [CreatedDate]     DATETIME                                           NOT NULL,
    [ModifiedBy]      VARCHAR (50)                                       NOT NULL,
    [ModifiedDate]    DATETIME                                           NOT NULL,
    CONSTRAINT [PK_Compenstaion_Contacts_ContactsID] PRIMARY KEY CLUSTERED ([ContactsID] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_Medical_Contacts_PhoneTypeID] FOREIGN KEY ([PhoneTypeID]) REFERENCES [common].[PhoneType] ([Id])
);

