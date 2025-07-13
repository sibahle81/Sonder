CREATE TABLE [common].[SwitchBatchType](
	[Id]	INT IDENTITY(1,1) NOT NULL,
	[Name]	VARCHAR(50)		  NOT NULL,
    CONSTRAINT [PK_common_SwitchBatchType] PRIMARY KEY CLUSTERED ([Id] ASC)
);
