
/****** Object:  Table [medical].[TebaInvoice]    Script Date: 2025/02/24 14:15:00 ******/

CREATE TABLE [medical].[TebaInvoice](
	[TebaInvoiceId] [int] IDENTITY(1,1) NOT NULL,
	[ClaimId] [int] NOT NULL,
	[PersonEventId] [int] NULL,
	[InvoicerId] [int] NOT NULL,
	[InvoicerTypeId] [int] NOT NULL,
	[HCPInvoiceNumber] [varchar](50) NULL,
	[HCPAccountNumber] [varchar](50) NULL,
	[InvoiceNumber] [varchar](50) NULL,
	[InvoiceDate] [datetime] NOT NULL,
	[DateSubmitted] [datetime] NOT NULL,
	[DateReceived] [datetime] NULL,
	[DateCompleted] [datetime] NULL,
	[DateTravelledFrom] [datetime] NULL,
	[DateTravelledTo] [datetime] NULL,
	[PreAuthId] [int] NULL,
	[InvoiceStatusId] [int] NOT NULL,
	[InvoiceAmount] [decimal](18, 2) NOT NULL,
	[InvoiceVAT] [decimal](18, 2) NOT NULL,
	[InvoiceTotalInclusive]  AS (isnull([InvoiceAmount],(0))+isnull([InvoiceVAT],(0))),
	[AuthorisedAmount] [decimal](18, 2) NOT NULL,
	[AuthorisedVAT] [decimal](18, 2) NOT NULL,
	[AuthorisedTotalInclusive]  AS ([AuthorisedAmount]+[AuthorisedVAT]),
	[PayeeId] [int] NOT NULL,
	[PayeeTypeId] [int] NOT NULL,
	[HoldingKey] [varchar](50) NULL,
	[IsPaymentDelay] [bit] NOT NULL,
	[IsPreauthorised] [bit] NOT NULL,
	[Description] [varchar](200) NULL,
	[CalcOperands] [varchar](200) NULL,
	[Kilometers] [decimal](7, 2) NOT NULL,
	[KilometerRate] [decimal](18, 2) NOT NULL,
	[TebaTariffCode] [varchar](10) NOT NULL,
	[VatCodeId] [int] NOT NULL,
	[VATPercentage] [decimal](7, 2) NULL,
	[SwitchBatchId] [int] NOT NULL,
	[SwitchTransactionNo] [varchar](50) NULL,
	[IsActive] [bit] NOT NULL,
	[IsDeleted] [bit] NOT NULL,
	[CreatedBy] [varchar](50) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_Medical_TebaInvoice_TebaInvoiceId] PRIMARY KEY CLUSTERED 
(
	[TebaInvoiceId] ASC
)WITH (PAD_INDEX = ON, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [medical].[TebaInvoice] ADD  CONSTRAINT [DF_TebaInvoice_SwitchBatchId]  DEFAULT ((0)) FOR [SwitchBatchId]
GO

ALTER TABLE [medical].[TebaInvoice]  WITH CHECK ADD  CONSTRAINT [FK_Medical_TebaInvoice_ClaimId] FOREIGN KEY([ClaimId])
REFERENCES [claim].[Claim] ([ClaimId])
GO

ALTER TABLE [medical].[TebaInvoice] CHECK CONSTRAINT [FK_Medical_TebaInvoice_ClaimId]
GO

ALTER TABLE [medical].[TebaInvoice]  WITH CHECK ADD  CONSTRAINT [FK_Medical_TebaInvoice_InvoiceStatusId] FOREIGN KEY([InvoiceStatusId])
REFERENCES [common].[InvoiceStatus] ([Id])
GO

ALTER TABLE [medical].[TebaInvoice] CHECK CONSTRAINT [FK_Medical_TebaInvoice_InvoiceStatusId]
GO

ALTER TABLE [medical].[TebaInvoice]  WITH CHECK ADD  CONSTRAINT [FK_Medical_TebaInvoice_VatCodeId] FOREIGN KEY([VatCodeId])
REFERENCES [common].[VatCode] ([Id])
GO

ALTER TABLE [medical].[TebaInvoice] CHECK CONSTRAINT [FK_Medical_TebaInvoice_VatCodeId]
GO

