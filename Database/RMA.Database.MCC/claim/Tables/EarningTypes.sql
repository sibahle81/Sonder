CREATE TABLE [claim].[EarningTypes] (
    [EarningTypeId] INT          IDENTITY (1, 1) NOT NULL,
    [Name]          VARCHAR (50) NOT NULL,
    [IsVariable]    BIT          NOT NULL,
    [IsRequired]    BIT          NOT NULL,
    [IsDeleted]     BIT          NOT NULL,
    [CreatedBy]     VARCHAR (50) NOT NULL,
    [CreatedDate]   DATETIME     NOT NULL,
    [ModifiedBy]    VARCHAR (50) NOT NULL,
    [ModifiedDate]  DATETIME     NOT NULL,
    PRIMARY KEY CLUSTERED ([EarningTypeId] ASC)
);

