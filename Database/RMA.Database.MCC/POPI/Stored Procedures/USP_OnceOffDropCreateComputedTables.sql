


--EXEC  POPI.USP_OnceOffDropCreateComputedTables
-- =============================================
-- Author:		RAM
-- Create date: 2021-09-20
-- Description:	POPI Automation Process
-- Process: (MaskingAllComputed)---Drop and re-create the Computed Tables with default Masking
-- =============================================

CREATE PROCEDURE [POPI].[USP_OnceOffDropCreateComputedTables]
	-- Add the parameters for the stored procedure here
AS
BEGIN


SET NOCOUNT ON;

---------------------------------DROP and re-create with default masking Computed Tables(7) with Foreign key constraints-------------------------------------------------
--IF OBJECT_ID(N'medical.InvoiceLine', N'U') IS NOT NULL  

   DROP TABLE medical.InvoiceLine;  

CREATE TABLE [medical].[InvoiceLine](
	[InvoiceLineId] [int] IDENTITY(1,1) NOT NULL,
	[InvoiceId] [int] NOT NULL,
	[ServiceDate] [datetime] NOT NULL,
	[RequestedQuantity] [decimal](7, 2) NULL,
	[AuthorisedQuantity] [decimal](7, 2) NOT NULL,
	[RequestedAmount] [decimal](18, 2) NOT NULL,
	[RequestedVAT] [decimal](18, 2) NOT NULL,
	[RequestedAmountInclusive]  AS (isnull([RequestedAmount],(0))+isnull([RequestedVat],(0))),
	[AuthorisedAmount] [decimal](18, 2) NULL,
	[AuthorisedVAT] [decimal](18, 2) NULL,
	[AuthorisedAmountInclusive]  AS (isnull([AuthorisedAmount],(0))+isnull([AuthorisedVAT],(0))),
	[TotalTariffAmount] [decimal](18, 2) NOT NULL,
	[TotalTariffVAT] [decimal](18, 2) NOT NULL,
	[TotalTariffAmountInclusive]  AS ([TotalTariffAmount]+[TotalTariffVAT]),
	[TariffAmount]  AS (((isnull([TotalTariffAmount],(0))+isnull([CreditAmount],(0)))+isnull([TotalTariffVat],(0)))/case when [AuthorisedQuantity]=(0) then (1) else [AuthorisedQuantity] end),
	[CreditAmount] [decimal](18, 2) NOT NULL,
	[VatCodeId] [int] NOT NULL,
	[VATPercentage] [decimal](7, 2) NULL,
	[TariffId] [int] NOT NULL,
	[TreatmentCodeId] [int] NOT NULL,
	[MedicalItemId] [int] NOT NULL,
	[HCPTariffCode] [varchar](12) NULL,
	[TariffBaseUnitCostTypeId] [int] NULL,
	[Description] [varchar](2048) NULL,
	[SummaryInvoiceLineId] [int] NULL,
	[IsPerDiemCharge] [bit] NOT NULL,
	[IsDuplicate] [bit] NOT NULL,
	[DuplicateInvoiceLineId] [int] NOT NULL,
	[CalculateOperands] [varchar](2048) NULL,
	[ICD10Code] [varchar](255) NULL,
	[IsActive] [bit] NOT NULL,
	[IsDeleted] [bit] NOT NULL,
	[CreatedBy] [varchar](50) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_Medical_InvoiceLineId] PRIMARY KEY CLUSTERED 
(
	[InvoiceLineId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 95) ON [PRIMARY]
) ON [PRIMARY]



ALTER TABLE [medical].[InvoiceLine] ADD  CONSTRAINT [DF__InvoiceLi__IsAct__5478F159]  DEFAULT ((1)) FOR [IsActive]

ALTER TABLE [medical].[InvoiceLine] ADD  CONSTRAINT [DF__InvoiceLi__IsDel__556D1592]  DEFAULT ((0)) FOR [IsDeleted]

ALTER TABLE [medical].[InvoiceLine] ADD  CONSTRAINT [DF__InvoiceLi__Creat__566139CB]  DEFAULT (getdate()) FOR [CreatedDate]


-----------------------------------------------==================================================================================
--IF OBJECT_ID(N'medical.Invoice', N'U') IS NOT NULL  
   DROP TABLE medical.Invoice;  

CREATE TABLE [medical].[Invoice](
	[InvoiceId] [int] IDENTITY(1,1) NOT NULL,
	[ClaimId] [int] NULL,
	[PersonEventId] [int] NULL,
	[HealthCareProviderId] [int] NOT NULL,
	[HCPInvoiceNumber] [varchar](50) NULL,
	[HCPAccountNumber] [varchar](50) NULL,
	[InvoiceNumber] [varchar](50) NULL,
	[InvoiceDate] [datetime] NOT NULL,
	[DateSubmitted] [datetime] NULL,
	[DateReceived] [datetime] NULL,
	[DateAdmitted] [datetime] NULL,
	[DateDischarged] [datetime] NULL,
	[PreAuthId] [int] NULL,
	[InvoiceStatusId] [int] NOT NULL,
	[InvoiceAmount] [decimal](18, 2) NOT NULL,
	[InvoiceVAT] [decimal](18, 2) NOT NULL,
	[InvoiceTotalInclusive]  AS ([InvoiceAmount]+[InvoiceVAT]),
	[AuthorisedAmount] [decimal](18, 2) NOT NULL,
	[AuthorisedVAT] [decimal](18, 2) NOT NULL,
	[AuthorisedTotalInclusive]  AS ([AuthorisedAmount]+[AuthorisedVAT]),
	[PayeeID] [int] NOT NULL,
	[PayeeTypeID] [int] NOT NULL,
	[UnderAssessedComments] [varchar](2048) NULL,
	[SwitchBatchInvoiceID] [int] NULL,
	[HoldingKey] [varchar](50) NULL,
	[IsPaymentDelay] [bit] NOT NULL,
	[IsPreauthorised] [bit] NOT NULL,
	[PreAuthXML] [xml] NULL,
	[Comments] [varchar](2000) NULL,
	[IsActive] [bit] NOT NULL,
	[IsDeleted] [bit] NOT NULL,
	[CreatedBy] [varchar](50) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NOT NULL,
	[ModifiedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_Medical_Invoice] PRIMARY KEY CLUSTERED 
(
	[InvoiceId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 95) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]


ALTER TABLE [medical].[Invoice] ADD  CONSTRAINT [DF__Invoice__IsActiv__6C858514]  DEFAULT ((1)) FOR [IsActive]

ALTER TABLE [medical].[Invoice] ADD  CONSTRAINT [DF__Invoice__IsDelet__6D79A94D]  DEFAULT ((0)) FOR [IsDeleted]

ALTER TABLE [medical].[Invoice] ADD  CONSTRAINT [DF__Invoice__Created__6E6DCD86]  DEFAULT (getdate()) FOR [CreatedDate]





END