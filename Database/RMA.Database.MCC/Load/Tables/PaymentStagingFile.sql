CREATE TABLE [Load].[PaymentStagingFile] (
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[FileIdentifier] [uniqueidentifier] NOT NULL,
	[FileName] [varchar](256) NOT NULL,
	[Company] [varchar](256) NOT NULL,
	[PaymentMonthYear] [varchar](14) NOT NULL,
	[TotalPaymentReceived] [decimal] (18, 2) NOT NULL,
	[CollectionFeePercentage] [decimal] (18, 2) NOT NULL,
	[CollectionFeeAmount] [decimal] (18, 2) NOT NULL,
	[CollectionFeeVatPercentage] [decimal] (18, 2) NOT NULL,
	[CollectionFeeVatAmount] [decimal] (18, 2) NOT NULL,
	[TotalPayment] [decimal] (18, 2) NOT NULL,
	[FileProcessingStatusId] [int] NULL,
	[IsDeleted] [bit] NOT NULL,
	[CreatedBy] [varchar](50) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
) WITH (PAD_INDEX = ON, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [Load].[PaymentStagingFile]
	WITH CHECK ADD  CONSTRAINT [FK_PaymentStagingFile_UploadedFileProcessingStatus] FOREIGN KEY([FileProcessingStatusId])
REFERENCES [common].[UploadedFileProcessingStatus] ([Id])
GO