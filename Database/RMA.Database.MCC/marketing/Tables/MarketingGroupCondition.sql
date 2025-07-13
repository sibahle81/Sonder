CREATE TABLE [marketing].[MarketingGroupCondition] (
    [MarketingGroupConditionId] INT           IDENTITY (1, 1) NOT NULL,
    [EntityName]                VARCHAR (500) NOT NULL,
    [EntityDataType]            VARCHAR (500) NOT NULL,
    [EntityCondition]           VARCHAR (500) NOT NULL,
    [IsDeleted]                 BIT           NOT NULL,
    [CreatedBy]                 VARCHAR (100) NOT NULL,
    [CreatedDate]               DATETIME      NOT NULL,
    [ModifiedBy]                VARCHAR (100) NOT NULL,
    [ModifiedDate]              DATETIME      NOT NULL,
    CONSTRAINT [PK_MarketingGroupCondition] PRIMARY KEY CLUSTERED ([MarketingGroupConditionId] ASC)
);

