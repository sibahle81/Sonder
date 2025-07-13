CREATE TABLE [product].[ProductOptionSetting](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[ProductOptionId] [int] NOT NULL,
	[Name] [varchar](50) NOT NULL,
	[Value] [varchar](MAX) NOT NULL,
	[SettingTypeId] [int] NOT NULL,
	[SettingCategoryId] [int] NOT NULL,
	[Description] [varchar](50) NULL,	
	[IsDeleted] [bit] NOT NULL,
	[CreatedBy] [varchar](50) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_ProductOptionSetting] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = ON, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [product].[ProductOptionSetting]  WITH NOCHECK ADD  CONSTRAINT [FK_ProductOptionSetting_ProductOption] FOREIGN KEY([ProductOptionId])
REFERENCES [product].[ProductOption] ([Id])
GO

ALTER TABLE [product].[ProductOptionSetting] CHECK CONSTRAINT [FK_ProductOptionSetting_ProductOption]
GO

ALTER TABLE [product].[ProductOptionSetting]  WITH NOCHECK ADD  CONSTRAINT [FK_ProductOptionSetting_SettingCategory] FOREIGN KEY([SettingCategoryId])
REFERENCES [common].[SettingCategory] ([Id])
GO

ALTER TABLE [product].[ProductOptionSetting] CHECK CONSTRAINT [FK_ProductOptionSetting_SettingCategory]
GO

ALTER TABLE [product].[ProductOptionSetting]  WITH NOCHECK ADD  CONSTRAINT [FK_ProductOptionSetting_SettingType] FOREIGN KEY([SettingTypeId])
REFERENCES [common].[SettingType] ([Id])
GO

ALTER TABLE [product].[ProductOptionSetting] CHECK CONSTRAINT [FK_ProductOptionSetting_SettingType]
GO