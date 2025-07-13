CREATE TABLE [Load].[PremiumPaymentFileValidationContent] (
    [Id]                INT              IDENTITY (1, 1) NOT NULL,
    [Company]           VARCHAR (100)    NULL,
    [GroupPolicyNumber] VARCHAR (50)     NULL,
    [Name]              VARCHAR (50)     NULL,
    [Surname]           VARCHAR (50)     NULL,
    [MemberIdNumber]    VARCHAR (50)     NULL,
    [PaymentDate]       VARCHAR (50)     NULL,
    [PaymentAmount]     VARCHAR (50)     NULL,
    [FileId]            INT              NOT NULL,
    [FileIdentifier]    UNIQUEIDENTIFIER NULL,
    [MemberNumber]      VARCHAR (50)     NULL,
    CONSTRAINT [PK_PremiumPaymentFileValidationContent] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_PremiumPaymentFileValidationContent_PremiumPaymentFileValidation] FOREIGN KEY ([FileId]) REFERENCES [Load].[PremiumPaymentFileValidation] ([FileId])
);



