	CREATE TABLE [policy].[ChildCover] (
    [Id]              INT            IDENTITY (1, 1) NOT NULL,
    [StartingAge]     INT            NOT NULL,
    [EndingAge]       INT            NOT NULL,
    [CoverPercentage] DECIMAL (5, 4) NOT NULL,
    [MaxCapCover]     DECIMAL (7, 2) NOT NULL,
    [IsActive]        BIT            DEFAULT ((1)) NOT NULL,
    [IsDeleted]       BIT            DEFAULT ((0)) NOT NULL,
    [CreatedBy]       VARCHAR (50)   NULL,
    [CreatedDate]     DATETIME       DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]      VARCHAR (50)   NULL,
    [ModifiedDate]    DATETIME       DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_policy_ChildCover] PRIMARY KEY CLUSTERED ([Id] ASC),
    UNIQUE NONCLUSTERED ([EndingAge] ASC),
    UNIQUE NONCLUSTERED ([StartingAge] ASC)
);


	GO