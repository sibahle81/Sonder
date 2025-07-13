CREATE TABLE [legal].[LegalRecoveryHead] (
    [Id]                               INT             IDENTITY (1, 1) NOT NULL,
    [Invoice]                          VARCHAR (100)   NOT NULL,
    [Date]                             DATETIME        NOT NULL,
    [Amount]                           NUMERIC (18, 2) NOT NULL,
    [UploadedBy]                       VARCHAR (100)   NOT NULL,
    [ClaimNumber]                      VARCHAR (100)   NOT NULL,
    [PolicyNumber]                     VARCHAR (100)   NOT NULL,
    [CustomerName]                     VARCHAR (250)   NOT NULL,
    [LegalCareInvoiceApprovalStatusId] INT             NOT NULL,
    [IsActive]                         BIT             DEFAULT ((1)) NOT NULL,
    [DocumentPath]                     VARCHAR (500)   NOT NULL,
    [IsApprove]                        BIT             NOT NULL,
    [IsDeleted]                        BIT             NOT NULL,
    [CreatedBy]                        VARCHAR (100)   NOT NULL,
    [CreatedDate]                      DATETIME        NOT NULL,
    [ModifiedBy]                       VARCHAR (100)   NOT NULL,
    [ModifiedDate]                     DATETIME        NOT NULL,
    CONSTRAINT [PK_LegalRecoveryHead] PRIMARY KEY CLUSTERED ([Id] ASC)
);

