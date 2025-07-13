CREATE TABLE [billing].[BundleRaiseHeader] (
    [BundleRaiseHeaderId] INT             IDENTITY (1, 1) NOT NULL,
    [IsDeleted]           BIT             NOT NULL,
    [CreatedBy]           VARCHAR (50)    NOT NULL,
    [CreatedDate]         DATETIME        NOT NULL,
    [ModifiedBy]          VARCHAR (50)    NOT NULL,
    [ModifiedDate]        DATETIME        NOT NULL,
    [TotalPremiums]       DECIMAL (18, 2) NOT NULL,
    [ApprovalDate]        DATETIME        NOT NULL,
    [ApprovedBy]          VARCHAR (50)    NOT NULL,
    CONSTRAINT [PK_billing.BundleRaiseHeader] PRIMARY KEY CLUSTERED ([BundleRaiseHeaderId] ASC)
);

