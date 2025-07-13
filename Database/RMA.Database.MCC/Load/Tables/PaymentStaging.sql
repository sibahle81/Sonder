CREATE TABLE [Load].[PaymentStaging] (
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[FileIdentifier] [uniqueidentifier] NOT NULL,
	[PayNumber] [varchar](20) NULL,
	[AreaCode] [varchar](20) NULL,
	[PolicyNumber] [varchar](30) NOT NULL,
	[PolicyId] [varchar](20) NOT NULL,
	[CommencementDate] [varchar](20) NOT NULL,
	[Initials] [varchar](5) NOT NULL,
	[Surname] [varchar](20) NOT NULL,
	[IdNumber] [varchar](13) MASKED WITH (FUNCTION = 'default()') NULL,
	[PaymentReceived] [decimal](18, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = ON, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE NONCLUSTERED INDEX IX_PaymentStaging_FileIdentifier
  ON [Load].[PaymentStaging] (FileIdentifier)

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'Yes' , @level0type=N'SCHEMA',@level0name=N'Load', @level1type=N'TABLE',@level1name=N'PaymentStaging', @level2type=N'COLUMN',@level2name=N'IdNumber'
GO
