CREATE TABLE [common].[Settings] (
    [Id]           INT            NOT NULL,
    [Key]          NVARCHAR (255) NOT NULL,
    [Value]        NVARCHAR (MAX) NOT NULL,
    [IsActive]     BIT            DEFAULT ((1)) NOT NULL,
    [IsDeleted]    BIT            DEFAULT ((0)) NOT NULL,
    [CreatedBy]    VARCHAR (50)   DEFAULT ('System') NOT NULL,
    [CreatedDate]  DATETIME       DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]   VARCHAR (50)   DEFAULT ('System') NOT NULL,
    [ModifiedDate] DATETIME       DEFAULT (getdate()) NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [UNQ_common.Setting_Key] UNIQUE NONCLUSTERED ([Key] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON)
);




GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO


