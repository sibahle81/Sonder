CREATE TABLE [claim].[ClaimAdditionalRequiredDocument] (
    [DocumentName]                      VARCHAR (255)  NULL,
    [ClaimAdditionalRequiredDocumentId] INT            IDENTITY (1, 1) NOT NULL,
    [PersoneventId]                     INT            NOT NULL,
    [DocumentId]                        INT            NOT NULL,
    [IsUploaded]                        BIT            DEFAULT ((0)) NOT NULL,
    [IsDeleted]                         BIT            NOT NULL,
    [CreatedBy]                         VARCHAR (50)   NOT NULL,
    [CreatedDate]                       DATETIME       NOT NULL,
    [ModifiedBy]                        VARCHAR (50)   NOT NULL,
    [ModifiedDate]                      DATETIME       NOT NULL,
    [DocumentGroupId]                   INT            NOT NULL,
    [VisibletoMember]                   BIT            DEFAULT ((0)) NOT NULL,
    [RequestNote]                       VARCHAR (1073) NULL,
    CONSTRAINT [PK_ClaimAdditionalRequiredDocument] PRIMARY KEY CLUSTERED ([ClaimAdditionalRequiredDocumentId] ASC),
    CONSTRAINT [FK_ClaimDocument_DocumentType] FOREIGN KEY ([DocumentId]) REFERENCES [documents].[DocumentType] ([Id]),
    CONSTRAINT [fk_ClaimPersoneventId] FOREIGN KEY ([PersoneventId]) REFERENCES [claim].[PersonEvent] ([PersonEventId])
);



