CREATE TABLE [medical].[TebaTariff](
	[TariffId] [int] IDENTITY(1,1) NOT NULL,
	[TariffCode] [varchar](50) NULL,
	[Description] [varchar](200) NULL,
	[InvoicingDescription] [varchar](150) NULL,
	[ValidFrom] [datetime] NOT NULL,
	[ValidTo] [datetime] NOT NULL,
	[CostValue] [decimal](10, 2) NOT NULL,
	[MinimumValue] [decimal](10, 2) NOT NULL,
	[AdminFeePercentage] [decimal](10, 2) NOT NULL,
	[IsDeleted] [bit] NOT NULL,
	[CreatedBy] [varchar](50) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
	[TariffCategoryId] [int] NULL,
	[RuleDescription] [varchar](150) NULL,
 CONSTRAINT [PK_TebaTariff] PRIMARY KEY CLUSTERED 
(
	[TariffId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 95) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [medical].[TebaTariff]  WITH CHECK ADD  CONSTRAINT [FK_TebaTariff_TariffCategoryId] FOREIGN KEY([TariffCategoryId])
REFERENCES [common].[TebaTariffCategory] ([Id])
GO

ALTER TABLE [medical].[TebaTariff] CHECK CONSTRAINT [FK_TebaTariff_TariffCategoryId]
GO

ALTER TABLE [medical].[TebaTariff]  WITH CHECK ADD  CONSTRAINT [FK_TebaTariff_TariffCode] FOREIGN KEY([TariffCode])
REFERENCES [common].[TebaTariffType] ([Id])
GO

ALTER TABLE [medical].[TebaTariff] CHECK CONSTRAINT [FK_TebaTariff_TariffCode]
GO
