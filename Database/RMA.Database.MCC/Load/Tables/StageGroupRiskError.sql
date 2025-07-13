CREATE TABLE [Load].[StageGroupRiskError] (
    [StageGroupRiskErrorId] INT           IDENTITY (1, 1) NOT NULL,
    [StageGroupRiskId]      INT           NULL,
    [ErrorMessage]          VARCHAR (MAX) NULL,
    [IsDeleted]             BIT           DEFAULT ((0)) NOT NULL,
    [CreatedDate]           DATETIME      DEFAULT (getdate()) NOT NULL,
    [CreatedBy]             VARCHAR (50)  NULL,
    [ModifiedDate]          DATETIME      DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]            VARCHAR (50)  NOT NULL,
    [ByPassError]           BIT           DEFAULT ((0)) NOT NULL,
    PRIMARY KEY CLUSTERED ([StageGroupRiskErrorId] ASC),
    FOREIGN KEY ([StageGroupRiskId]) REFERENCES [Load].[StageGroupRisk] ([StageGroupRiskId])
);

