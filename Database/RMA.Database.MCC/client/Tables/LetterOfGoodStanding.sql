CREATE TABLE [client].[LetterOfGoodStanding] (
    [LetterOfGoodStandingId] INT          IDENTITY (1, 1) NOT NULL,
    [RolePlayerId]           INT          NOT NULL,
    [IssueDate]              DATETIME     NOT NULL,
    [ExpiryDate]             DATETIME     NOT NULL,
    [CertificateNo]          VARCHAR (50) NOT NULL,
    [CreatedBy]              VARCHAR (50) NOT NULL,
    [CreatedDate]            DATETIME     NOT NULL,
    [ModifiedBy]             VARCHAR (50) NOT NULL,
    [ModifiedDate]           DATETIME     NOT NULL,
    CONSTRAINT [PK__LetterOf__9E54361729417CB8] PRIMARY KEY CLUSTERED ([LetterOfGoodStandingId] ASC),
    CONSTRAINT [FK_RolePlayerId_LetterOfGoodStanding] FOREIGN KEY ([RolePlayerId]) REFERENCES [client].[RolePlayer] ([RolePlayerId])
);



