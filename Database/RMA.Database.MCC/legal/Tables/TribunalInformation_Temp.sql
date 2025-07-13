CREATE TABLE [legal].[TribunalInformation_Temp] (
    [Id]                    INT             IDENTITY (1, 1) NOT NULL,
    [ReferralId]            INT             NOT NULL,
    [Class]                 VARCHAR (50)    NOT NULL,
    [PolicyNumber]          VARCHAR (100)   NOT NULL,
    [DateOfAccident]        DATETIME        NOT NULL,
    [ClaimNumber]           VARCHAR (100)   NOT NULL,
    [LiabilityStatus]       VARCHAR (100)   NOT NULL,
    [SystemReportReferal]   VARCHAR (100)   NOT NULL,
    [ExpensesValue]         NUMERIC (18, 2) NOT NULL,
    [DateOfReferral]        DATETIME        NOT NULL,
    [DescriptionOfAccident] VARCHAR (1000)  NOT NULL,
    [DateAssessed]          DATETIME        NOT NULL,
    [Comments]              VARCHAR (500)   NOT NULL,
    [IsActive]              BIT             NOT NULL,
    [IsDeleted]             BIT             NOT NULL,
    [CreatedBy]             VARCHAR (100)   NOT NULL,
    [CreatedDate]           DATETIME        NOT NULL,
    [ModifiedBy]            VARCHAR (100)   NOT NULL,
    [ModifiedDate]          DATETIME        NOT NULL,
    CONSTRAINT [PK_TribunalInformation_Temp] PRIMARY KEY CLUSTERED ([Id] ASC)
);

