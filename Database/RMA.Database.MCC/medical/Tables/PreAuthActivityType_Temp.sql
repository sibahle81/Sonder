CREATE TABLE [medical].[PreAuthActivityType_Temp] (
    [ActivityTypeId] INT           IDENTITY (0, 1) NOT NULL,
    [Code]           CHAR (2)      NOT NULL,
    [Name]           VARCHAR (50)  NOT NULL,
    [Description]    VARCHAR (100) NOT NULL,
    [IsActive]       BIT           DEFAULT ((1)) NOT NULL,
    [IsDeleted]      BIT           DEFAULT ((0)) NOT NULL,
    [CreatedBy]      VARCHAR (50)  NOT NULL,
    [CreatedDate]    DATETIME      DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]     VARCHAR (50)  NOT NULL,
    [ModifiedDate]   DATETIME      NOT NULL,
    PRIMARY KEY CLUSTERED ([ActivityTypeId] ASC)
);

