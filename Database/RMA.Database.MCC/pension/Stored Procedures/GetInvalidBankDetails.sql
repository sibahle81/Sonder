--exec  [finance].[RejectionReport] @DateFrom='2020-03-30',@DateTo='2020-06-26'
CREATE PROCEDURE [pension].[GetInvalidBankDetails]
AS
BEGIN
	 	
	SELECT P.[Payee] AS [AccountHolderName],
						p.[AccountNo] [AccountNumber],
						p.Bank [BankName],
						p.IdNumber [IdNumber],
						p.BankBranch [BranchCode],
						CAST(p.Branch AS int) [BankBranchId],
						'PEN001' [PensionCaseNumber]
						
	FROM [payment].[Payment] P (NOLOCK)
	LEFT JOIN [payment].[PaymentRejectionCode] PRC (NOLOCK) ON P.[ErrorCode] = PRC.[Code] AND  PRC.IsDeleted = 0 AND PRC.IsActive = 1
	Where PRC.Code in ('06',
'08',
'10',
'12',
'14',
'16',
'18',
'22',
'26',
'145',
'1055',
'1059') 

END