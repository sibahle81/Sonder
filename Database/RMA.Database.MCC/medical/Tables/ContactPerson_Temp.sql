CREATE TABLE [medical].[ContactPerson_Temp] (
    [ContactPersonID]    INT                                                  IDENTITY (1, 1) NOT NULL,
    [ContactTitleID]     INT                                                  NULL,
    [ContactName]        NVARCHAR (50) MASKED WITH (FUNCTION = 'default()')   NOT NULL,
    [ContactDescription] NVARCHAR (2048) MASKED WITH (FUNCTION = 'default()') NULL,
    [LanguageID]         INT                                                  NULL,
    [IsAuthorised]       BIT                                                  NOT NULL,
    [LastChangedBy]      VARCHAR (30)                                         NULL,
    [LastChangedDate]    DATETIME                                             NULL,
    [OwnerID]            INT                                                  NULL,
    [OwnerType]          TINYINT                                              NULL,
    [IsActive]           BIT                                                  NOT NULL,
    [IsDeleted]          BIT                                                  NOT NULL,
    [CreatedBy]          VARCHAR (50)                                         NOT NULL,
    [CreatedDate]        DATETIME                                             NOT NULL,
    [ModifiedBy]         VARCHAR (50)                                         NOT NULL,
    [ModifiedDate]       DATETIME                                             NOT NULL,
    CONSTRAINT [PK_Medical_ContactPerson_ContactPersonID] PRIMARY KEY CLUSTERED ([ContactPersonID] ASC) WITH (FILLFACTOR = 95),
    CONSTRAINT [FK_Medical_ContactPerson_ContactTitleID] FOREIGN KEY ([ContactTitleID]) REFERENCES [common].[Title] ([Id]),
    CONSTRAINT [FK_Medical_ContactPerson_LanguageID] FOREIGN KEY ([LanguageID]) REFERENCES [common].[Language] ([Id])
);

