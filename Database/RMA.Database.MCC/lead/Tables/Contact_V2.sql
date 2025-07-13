CREATE TABLE [lead].[Contact_V2] (
    [ContactId]                    INT          IDENTITY (1, 1) NOT NULL,
    [LeadId]                       INT          NOT NULL,
    [Name]                         VARCHAR (50) NOT NULL,
    [Surname]                      VARCHAR (50) NOT NULL,
    [EmailAddress]                 VARCHAR (50) NULL,
    [ContactNumber]                VARCHAR (50) NULL,
    [TelephoneNumber]              VARCHAR (50) NULL,
    [PreferredCommunicationTypeId] INT          NULL,
    [IsDeleted]                    BIT          NOT NULL,
    [CreatedBy]                    VARCHAR (50) NOT NULL,
    [CreatedDate]                  DATETIME     NOT NULL,
    [ModifiedBy]                   VARCHAR (50) NOT NULL,
    [ModifiedDate]                 DATETIME     NOT NULL,
    CONSTRAINT [PK_Contact_V2] PRIMARY KEY CLUSTERED ([ContactId] ASC),
    CONSTRAINT [FK_Contact_V2_Lead] FOREIGN KEY ([LeadId]) REFERENCES [lead].[Lead] ([LeadId])
);

