CREATE TABLE [claim].[ClaimBenefitType] (
    [ClaimBenefitTypeId] INT           IDENTITY (1, 1) NOT NULL,
    [Name]               VARCHAR (50)  NOT NULL,
    [Description]        VARCHAR (250) NOT NULL,
    [CreatedBy]          VARCHAR (50)  NOT NULL,
    [CreatedDate]        DATETIME      NOT NULL,
    [ModifiedBy]         VARCHAR (50)  NOT NULL,
    [ModifiedDate]       DATETIME      NOT NULL,
    CONSTRAINT [PK_ClaimBenefitType] PRIMARY KEY CLUSTERED ([ClaimBenefitTypeId] ASC)
);

