

CREATE PROCEDURE [billing].[CollectionsAgeingReport](
@EndDate Datetime,
@IndustryId int,           -- 0=all 1=Mining 2=Metals 3=Other 4=Individual 5=Group
@BalanceTypeId Int,        -- 0=all 1=all non-zero 2=greater than zero 3=less than zero
@DebtorStatus Int,         -- 0=all 1=active 2=inactive
@ClientTypeId Int,          -- 0=all 1=individual 2=group 3=corporate
@ProductName VARCHAR(50)) 

AS 
BEGIN
    
    --declare @EndDate Datetime = getdate()
    --declare @IndustryId int =0       -- 0=all 1=Mining 2=Metals 3=Other 4=Individual 5=Group
    --declare @BalanceTypeId Int = 0      -- 0=all 1=all non-zero 2=greater than zero 3=less than zero
    --declare @DebtorStatus Int = 0         -- 0=all 1=active 2=inactive
    --declare @ClientTypeId Int = 0       -- 0=all 1=individual 2=group 3=corporate
    --declare @ProductName VARCHAR(50) ='All'

IF @ProductName = 'All'
	BEGIN
	   SELECT @ProductName = NULL;
	END

SET NOCOUNT ON;    
	DECLARE @DWLoadDateID INT,
    @Step DATETIME,
    @Msg VARCHAR(1000)

    SET @Step = GETDATE()
    SET @DWLoadDateID = (YEAR(GETDATE()) * 10000) + (MONTH(GETDATE()) * 100) + (DAY(GETDATE()))
    
    
IF OBJECT_ID(N'tempdb..#TempBillingTransactions', N'U') IS NOT NULL
                DROP TABLE #TempBillingTransactions;

create table #TempBillingTransactions(  
                [TransactionId] [int] NOT NULL,
                [InvoiceId] [int] NULL,
                [RolePlayerId] [int] NOT NULL,
                [BankStatementEntryId] [int] NULL,
                [TransactionTypeLinkId] [int] NOT NULL,
                [Amount] [decimal](18, 2) NOT NULL,
                [TransactionDate] [datetime] NOT NULL,
                [BankReference] [varchar](50) NULL,
                [TransactionTypeId] [int] NOT NULL,
                [CreatedDate] [datetime] NOT NULL,
                [ModifiedDate] [datetime] NOT NULL,
                [CreatedBy] [varchar](50) NOT NULL,
                [ModifiedBy] [varchar](50) NOT NULL,
                [Reason] [varchar](255) NULL,
                [RmaReference] [varchar](100) NULL,
                [LinkedTransactionId] [int] NULL,
                [ClaimRecoveryInvoiceId] [int] NULL,
                [IsLogged] [bit] NULL,
                [AdhocPaymentInstructionId] [int] NULL,
                [IsReAllocation] [bit] NULL,
                [Balance] [decimal](18, 2) NULL
)

CREATE NONCLUSTERED INDEX IX_Transactions ON #TempBillingTransactions (TransactionId)
WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, 
DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY];

insert #TempBillingTransactions
SELECT bt.[TransactionId],
                bt.[InvoiceId],
                bt.[RolePlayerId],
                bt.[BankStatementEntryId],
                bt.[TransactionTypeLinkId],
                bt.[Amount],
                bt.[TransactionDate],
                bt.[BankReference],
                bt.[TransactionTypeId],
                bt.[CreatedDate],
                bt.[ModifiedDate],
                bt.[CreatedBy],
                bt.[ModifiedBy],
                bt.[Reason],
                bt.[RmaReference],
                bt.[LinkedTransactionId],
                bt.[ClaimRecoveryInvoiceId],
                bt.[IsLogged],
                bt.[AdhocPaymentInstructionId],
                bt.[IsReAllocation],
		        CASE WHEN bt.TransactionTypeLinkId = 1 THEN bt.Amount ELSE - bt.Amount END AS Balance

FROM billing.Transactions bt
INNER JOIN [client].[RolePlayer] R ON bt.RolePlayerId = R.RolePlayerId
INNER JOIN [client].[FinPayee] F ON R.RolePlayerId=F.RolePlayerId
LEFT JOIN [common].[Industry] IC ON IC.Id =F.IndustryId
LEFT JOIN [common].[IndustryClass] ICD ON ICD.Id =IC.IndustryClassId
OUTER APPLY (SELECT Balance = [dbo].[GetTransactionBalance] (bt.TransactionId)) TransactionBalanceS
WHERE bt.[TransactionTypeId] not in (14, 15, 16)
and bt.[TransactionTypeId] = 6
AND bt.CreatedDate <= @EndDate
--AND (bt.TransactionId NOT IN (SELECT bt.TransactionId FROM Billing.Transactions WHERE ([dbo].[GetTransactionBalance] (bt.TransactionId) = 0) AND bt.TransactionTypeId = 6 AND bt.CreatedDate <= @EndDate))
AND (ICD.Id > CASE WHEN (@IndustryId = 0 OR @IndustryId IS NULL) THEN 0 END
OR          ICD.Id = CASE WHEN (@IndustryId > 0) THEN  @IndustryId END)
and EXISTS (SELECT p.* FROM [common].[Period] p WHERE p.StartDate >= bt.TransactionDate and p.[Status] != 'Future')
and bt.IsDeleted = 0



insert #TempBillingTransactions
SELECT bt.[TransactionId],
                bt.[InvoiceId],
                bt.[RolePlayerId],
                bt.[BankStatementEntryId],
                bt.[TransactionTypeLinkId],
                bt.[Amount],
                bt.[TransactionDate],
                bt.[BankReference],
                bt.[TransactionTypeId],
                bt.[CreatedDate],
                bt.[ModifiedDate],
                bt.[CreatedBy],
                bt.[ModifiedBy],
                bt.[Reason],
                bt.[RmaReference],
                bt.[LinkedTransactionId],
                bt.[ClaimRecoveryInvoiceId],
                bt.[IsLogged],
                bt.[AdhocPaymentInstructionId],
                bt.[IsReAllocation],
                CASE WHEN bt.TransactionTypeLinkId = 1 THEN bt.Amount ELSE - bt.Amount END AS Balance

FROM billing.Transactions bt
INNER JOIN [client].[RolePlayer] R ON bt.RolePlayerId = R.RolePlayerId
INNER JOIN [client].[FinPayee] F ON R.RolePlayerId=F.RolePlayerId
LEFT JOIN [common].[Industry] IC ON IC.Id =F.IndustryId
LEFT JOIN [common].[IndustryClass] ICD ON ICD.Id =IC.IndustryClassId
OUTER APPLY (SELECT Balance = [dbo].[GetTransactionBalance] (bt.TransactionId)) TransactionBalanceS
WHERE bt.[TransactionTypeId] not in (14, 15, 16)
and bt.[TransactionTypeId] != 6
AND bt.CreatedDate <= @EndDate
------AND (bt.TransactionId NOT IN (SELECT bt.TransactionId FROM Billing.Transactions WHERE ([dbo].[GetTransactionBalance] (bt.TransactionId) = 0) AND bt.TransactionTypeId = 6 AND bt.CreatedDate <= @EndDate))
AND (ICD.Id > CASE WHEN (@IndustryId = 0 OR @IndustryId IS NULL) THEN 0 END
OR          ICD.Id = CASE WHEN (@IndustryId > 0) THEN  @IndustryId END)
and NOT EXISTS (SELECT p.* FROM [common].[Period] p WHERE p.StartDate <= bt.TransactionDate and p.[Status] = 'Future')



-- Create ageing structure

IF OBJECT_ID(N'tempdb..#TempInvoices', N'U') IS NOT NULL
                DROP TABLE #TempInvoices;

SELECT DISTINCT 
                icd.[Name] AS Industry,
                icd.id as IndustryId,
                bt.TransactionId AS TransactionsTransactionId,
                bt.InvoiceId AS TransactionsInvoiceId,                     
                bia.InvoiceId AS AllocationInvoiceId,
                bt.TransactionDate,  
                bt.CreatedDate, 
                ISNULL(pp.PolicyStatusId,0) AS PolicyStatusId,
                CASE ISNULL(ccmp.[RolePlayerId], 0) WHEN 0 THEN 1 ELSE (CASE RIGHT(ISNULL(ccmp.[ReferenceNumber], '99'), 2) WHEN '99' THEN 2 ELSE 3 END) END [ClientTypeId],                
                YEAR(bt.CreatedDate) AS [dr_yyyy],  
                CASE WHEN ICD.Id = 4 AND ppr.Id in (1,2)  THEN
                    (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'INDF')
					 WHEN ICD.Id = 2 AND ppr.Id in (4) THEN
                    (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE  Origin = 'RMA COID METALS')
                    WHEN ICD.Id = 1 AND ppr.Id in (4) THEN 
                    (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE  Origin = 'RMA COID MINING')
					WHEN ICD.Id = 2 AND ppr.Id in (1,2) THEN 
                    (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Metals')
					WHEN ICD.Id = 3 AND ppr.Id not in (1,2) THEN 
					(SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE  Origin = 'RML NON COID CLASS OTHER')
					WHEN ppr.Id  in (5,6,7) THEN 
					(SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE  Origin = 'RMA NON COID MINING')
					WHEN ICD.Id = 1 and ppr.Id in (1,2) THEN 
                    (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Mining')
					WHEN ICD.Id = 2  and ppr.Id in (1,2) THEN 
                    (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Metals')
					WHEN ICD.Id in (3,5) AND ppr.Id in (1,2) THEN
                    (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Class Other')
                END AS  ControlNumber,
                Year(Bt.TransactionDate) AS [underwriting_yyyy],                
                  CASE WHEN ICD.Id = 4 AND ppr.Id in (1,2) THEN
                    (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'INDF')
					 WHEN ICD.Id = 2 AND ppr.Id in (4) THEN
                    (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType]  WHERE  Origin = 'RMA COID METALS')
					WHEN ICD.Id = 1 AND ppr.Id  in (4) THEN 
                    (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE  Origin = 'RMA COID MINING')
					WHEN ICD.Id = 2 AND ppr.Id in (1,2) THEN 
                    (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Metals')
					WHEN ICD.Id = 3 AND ppr.Id not in (1,2) THEN 
					(SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE  Origin = 'RML NON COID CLASS OTHER')
					WHEN ppr.Id  in (5,6,7) THEN 
					(SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE  Origin = 'RMA NON COID MINING')
					WHEN ICD.Id = 1 and ppr.Id in (1,2) THEN 
                    (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Mining')
					WHEN ICD.Id = 2  and ppr.Id in (1,2) THEN 
                    (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Metals')
					WHEN ICD.Id in (3,5) THEN
                    (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Class Other')
                END AS [Product],
                cfp.FinPayeNumber AS [dr_no],
                CASE WHEN crp.RolePlayerIdentificationTypeId = 2 THEN ccmp.Name
					 WHEN crp.RolePlayerIdentificationTypeId = 1 THEN cpn.FirstName + ' ' + cpn.Surname 
					 END AS [name],
                CASE WHEN ctp.Name Like '%Invoice%' AND YEAR(bt.CreatedDate) <> YEAR(@EndDate) THEN 'Invoice-Other-Period'    -- FN 03122020
                     WHEN ctp.Name Like '%Invoice%' AND YEAR(bt.CreatedDate) = YEAR(@EndDate) THEN 'Invoice'
                     ELSE ctp.Name END  AS [Type], 
                ctp.Name as TypeOG,
                bi.CreatedDate as CreatedDateINV,
                bi.invoicenumber,
                bi.invoiceid,
                bt.createddate as btcreateddate,
                bi.invoicedate as invoicedate,
                pp.PolicyInceptionDate,
                prod.Name as ProdOption,
                ppr.Name as ProductType,
                br.Name as BrokerName,
                parp.[DisplayName] as PolicyHolderName,
                parp.[DisplayName] AS [Group],
                CASE WHEN bt.TransactionTypeId = 6 THEN bi2.InvoiceNumber
                     WHEN bt.TransactionTypeId = 3 AND bt.BankReference LIKE '01-%' THEN bt.RmaReference 
                     WHEN bt.BankReference IS NULL THEN bt.RmaReference
                     WHEN bt.BankReference LIKE '' THEN bt.RmaReference 
                     ELSE bt.BankReference  END AS [DocumentNo],
                --[dbo].[GetTransactionBalance] (bt.TransactionId) AS [DocBalance],  
		        CASE WHEN bt.TransactionTypeLinkId = 1 THEN bt.Amount ELSE - bt.Amount END AS [DocBalance],

               -- January Current Year
                CASE WHEN YEAR(bt.TransactionDate)= YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 1 AND BT.TransactionTypeId = 6 THEN 1 ELSE 0 END AS  [JAN-Invoice],
               (CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 1 AND Bt.TransactionTypeId = 6 THEN bt.Amount  ELSE 0 END)  AS  [JAN-Raised],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 1  AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount)* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [JAN-Collect],
                --CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate,bt.CreatedDate)) = 1  AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 2) AND (bt.TransactionTypeId = 4) THEN bia.Amount*  (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [JAN-Credit],  
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 1  AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4) THEN ISNULL(bia.Amount,bt.Amount) -1  ELSE 0 END AS [JAN-Credit],
                
                -- February Current Year
                CASE WHEN YEAR(bt.TransactionDate)= YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 2 AND BT.TransactionTypeId = 6 THEN 1 ELSE 0 END AS  [FEB-Invoice],
               (CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 2 AND Bt.TransactionTypeId = 6 THEN bt.Amount  ELSE 0 END)  AS  [FEB-Raised],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 2 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [FEB-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 2 AND (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [FEB-Credit],  
                
                -- March Current Year
                CASE WHEN YEAR(bt.TransactionDate)= YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 3 AND BT.TransactionTypeId = 6 THEN 1 ELSE 0 END AS  [MAR-Invoice],
               (CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 3 AND Bt.TransactionTypeId = 6 THEN bt.Amount  ELSE 0 END)  AS  [MAR-Raised],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 3 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [MAR-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 3 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1  ELSE 0 END AS [MAR-Credit],     
                
                -- April Current Year
                CASE WHEN YEAR(bt.TransactionDate)= YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 4 AND BT.TransactionTypeId = 6 THEN 1 ELSE 0 END AS  [APR-Invoice],
               (CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 4 AND Bt.TransactionTypeId = 6 THEN bt.Amount  ELSE 0 END)  AS  [APR-Raised],             
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 4 AND  (bt.TransactionTypeLinkId = 2)  AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [APR-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 4 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [APR-Credit],    
                
                -- May Current Year
                CASE WHEN YEAR(bt.TransactionDate)= YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 5 AND BT.TransactionTypeId = 6 THEN 1 ELSE 0 END AS  [MAY-Invoice],
               (CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 5 AND Bt.TransactionTypeId = 6 THEN bt.Amount  ELSE 0 END)  AS  [MAY-Raised],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 5 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [MAY-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 5 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [MAY-Credit],  
               
                                                    -- June Current Year
                CASE WHEN YEAR(bt.TransactionDate)= YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 6 AND BT.TransactionTypeId = 6 THEN 1 ELSE 0 END AS  [JUN-Invoice],
               (CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 6 AND Bt.TransactionTypeId = 6 THEN bt.Amount  ELSE 0 END)  AS  [JUN-Raised],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 6 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [JUN-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 6 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [JUN-Credit],     
                
                -- July Current Year
                CASE WHEN YEAR(bt.TransactionDate)= YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 7 AND BT.TransactionTypeId = 6 THEN 1 ELSE 0 END AS  [JUL-Invoice],
               (CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 7 AND Bt.TransactionTypeId = 6 THEN bt.Amount  ELSE 0 END)  AS  [JUL-Raised],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 7 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [JUL-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 7 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [JUL-Credit],  
                
                -- August Current Year
                CASE WHEN YEAR(bt.TransactionDate)= YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 8 AND BT.TransactionTypeId = 6 THEN 1 ELSE 0 END AS  [AUG-Invoice],
               (CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 8 AND Bt.TransactionTypeId = 6 THEN bt.Amount  ELSE 0 END)  AS  [AUG-Raised],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 8  AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [AUG-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 8  AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [AUG-Credit],  
                
                                                                -- September Current Year
                CASE WHEN YEAR(bt.TransactionDate)= YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 9 AND BT.TransactionTypeId = 6 THEN 1 ELSE 0 END AS  [SEP-Invoice],
               (CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 9 AND Bt.TransactionTypeId = 6 THEN bt.Amount  ELSE 0 END)  AS  [SEP-Raised],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 9 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [SEP-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 9 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [SEP-Credit],  
                                                                              
                                                                -- October Current Year
                CASE WHEN YEAR(bt.TransactionDate)= YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 10 AND BT.TransactionTypeId = 6 THEN 1 ELSE 0 END AS  [OCT-Invoice],
               (CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 10 AND Bt.TransactionTypeId = 6 THEN bt.Amount  ELSE 0 END)  AS  [OCT-Raised],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 10 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [OCT-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 10 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4) THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [OCT-Credit],     
                               
                                                    -- November Current Year
                CASE WHEN YEAR(bt.TransactionDate)= YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 11 AND BT.TransactionTypeId = 6 THEN 1 ELSE 0 END AS  [NOV-Invoice],
               (CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 11 AND Bt.TransactionTypeId = 6 THEN bt.Amount  ELSE 0 END)  AS  [NOV-Raised],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 11 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [NOV-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 11 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [NOV-Credit],   
                
                -- December Current Year
                CASE WHEN YEAR(bt.TransactionDate)= YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 12 AND BT.TransactionTypeId = 6 THEN 1 ELSE 0 END AS  [DEC-Invoice],
               (CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 12 AND Bt.TransactionTypeId = 6 THEN bt.Amount  ELSE 0 END)  AS  [DEC-Raised],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 12 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [DEC-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 12 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [DEC-Credit],   

                
                
                -- YEAR 1
                -- January  
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)- 1 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 1 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year1-Jan-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)- 1 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 1 AND (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [Year1-Jan-Credit],   
                
                -- Februay  
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)- 1 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 2 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year1-Feb-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)- 1 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 2 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [Year1-Feb-Credit],     
                
               -- March  
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)- 1 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 3 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year1-Mar-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 3 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [Year1-Mar-Credit],     
                
	            -- April  
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 4 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year1-Apr-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 4 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [Year1-Apr-Credit],     
                
                -- May  
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 5 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year1-May-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 5 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [Year1-May-Credit],   
                
                -- June  
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 6 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year1-Jun-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 6 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [Year1-Jun-Credit],    
                
                -- July  
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 7 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year1-Jul-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 7 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [Year1-jul-Credit],  
                                                                
                -- August  
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 8 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year1-Aug-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 8 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1  ELSE 0 END AS [Year1-Aug-Credit],    
                
                -- September  
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 9 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year1-Sep-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 9 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [Year1-Sep-Credit],  
                
                -- October  
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 10 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year1-Oct-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 10 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [Year1-Oct-Credit],  
                
                -- November  
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 11 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year1-Nov-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 11 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [Year1-Nov-Credit],  
                -- December  
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 12 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year1-Dec-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 12 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [Year1-Dec-Credit],  
                
                
                
                -- YEAR 2
                -- January  
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 1 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year2-Jan-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 1 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [Year2-Jan-Credit],   
                
                -- Februay  
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 2 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year2-Feb-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 2 AND (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [Year2-Feb-Credit],      
                
                -- March  
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 3 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year2-Mar-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 3 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [Year2-Mar-Credit],     
                
                -- April  
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 4 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year2-Apr-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 4 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [Year2-Apr-Credit],   
                
                -- May  
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 5 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year2-May-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 5 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [Year2-May-Credit],     
                
                                                                -- June  
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 6 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year2-Jun-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 6 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [Year2-Jun-Credit],  
                
                                                                -- July  
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 7 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year2-Jul-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 7 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [Year2-Jul-Credit],   
                
                                                                -- August  
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 8 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year2-Aug-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 8 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [Year2-Aug-Credit],  
                                                                
                                                                -- September  
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 9 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year2-Sep-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 9 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [Year2-Sep-Credit],   
                
                                                                -- October  
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 10 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year2-Oct-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 10 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [Year2-Oct-Credit],  
                                                                
                                                                -- November  
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 11 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year2-Nov-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 11 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [Year2-Nov-Credit],     
                
                                                                -- December  
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 12 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year2-Dec-Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate,bt.TransactionDate)) = 12 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [Year2-Dec-Credit],  
 
 
                                                                -- YEAR 3   
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-3 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year3-Collect],
               CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))= YEAR(@EndDate)-3 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1  ELSE 0 END AS [Year3-Credit],     
                
                                                                -- YEAR 4+ 
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))< YEAR(@EndDate)-3 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId <> 4) THEN ISNULL(bia.Amount,bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year4+Collect],
                CASE WHEN YEAR(ISNULL(bia.CreatedDate,bt.TransactionDate))< YEAR(@EndDate)-3 AND  (bt.TransactionTypeLinkId in (2)) AND (bt.TransactionTypeId = 4)  THEN ISNULL(bia.Amount,bt.Amount) * -1 ELSE 0 END AS [Year4+Credit],               
                
                                                                
                Case When (bt.TransactionId = bia.TransactionId) Then 'Allocated' Else 'Unallocated' End As [Flag] 

INTO #TempInvoices        
FROM 
#TempBillingTransactions bt
LEFT JOIN Billing.InvoiceAllocation  bia ON bt.TransactionId = bia.TransactionId 
LEFT JOIN Billing.Invoice bi ON bi.InvoiceId = bia.InvoiceId 
LEFT JOIN Client.RolePlayer crp ON bt.RolePlayerId = crp.RolePlayerId  -- displayname AS name
LEFT JOIN Client.FinPayee cfp ON bt.RolePlayerId = cfp.RolePlayerID       -- finPayeeNumber AS dr number  
LEFT JOIN Common.TransactionType ctp ON bt.TransactionTypeId = ctp.Id   -- Type     
LEFT JOIN Client.Person cpn ON  crp.RolePlayerId = cpn.RolePlayerId
LEFT JOIN Client.Company ccmp ON crp.RolePlayerId = ccmp.RolePlayerId
LEFT JOIN [client].[RolePlayer] R ON bt.RolePlayerId = R.RolePlayerId
LEFT JOIN [client].[FinPayee] F ON R.RolePlayerId=F.RolePlayerId
LEFT JOIN [common].[Industry] IC ON IC.Id =F.IndustryId
LEFT JOIN [common].[IndustryClass] ICD ON ICD.Id =IC.IndustryClassId
LEFT JOIN [Billing].[Invoice] bi2 ON bt.InvoiceId = bi2.InvoiceId
LEFT JOIN [Policy].[Policy] pp ON bt.RolePlayerId = pp.[PolicyOwnerId]
LEFT JOIN [product].[ProductOption] (NOLOCK) prod ON prod.id = pp.ProductOptionId
LEFT join [product].[Product] (NOLOCK) ppr ON prod.ProductId = ppr.Id
LEFT JOIN broker.Brokerage BR WITH (NOLOCK) ON BR.Id = pp.BrokerageId
LEFT JOIN [policy].[Policy] papol (nolock) on papol.PolicyId = pp.ParentPolicyId
LEFT JOIN [client].[roleplayer] parp (nolock) on parp.RolePlayerId = pp.policyOwnerId
OUTER APPLY (SELECT Balance = [dbo].[GetTransactionBalance] (bt.TransactionId)) TransactionBalanceS
WHERE 
(bt.[TransactionTypeId] NOT IN (14, 15, 16))
-- AND (bt.TransactionId NOT IN (SELECT bt.TransactionId FROM Billing.Transactions WHERE ([dbo].[GetTransactionBalance] (bt.TransactionId) = 0) AND bt.TransactionTypeId = 6 AND bt.CreatedDate <= @EndDate))
AND (ICD.Id > CASE WHEN (@IndustryId = 0 OR @IndustryId IS NULL) THEN 0 END
OR          ICD.Id = CASE WHEN (@IndustryId > 0) THEN  @IndustryId END)
--and ((TransactionTypeId = 6 and EXISTS (SELECT p.* FROM [common].[Period] p WHERE p.StartDate >= bt.TransactionDate and p.[Status] != 'Future')) or (TransactionTypeId != 6 and NOT EXISTS (SELECT p.* FROM [common].[Period] p WHERE p.StartDate <= bt.TransactionDate and p.[Status] = 'Future')))
AND (ppr.Name IN (SELECT value from STRING_SPLIT ( @ProductName , ',')) OR @ProductName IS NULL)
AND bt.CreatedDate <= @EndDate



---- Apply Filters

IF (@clientTypeId > 0) 
    BEGIN
        DELETE FROM #TempInvoices WHERE [ClientTypeId] != @clientTypeId
    END


IF @balanceTypeId = 0 
    BEGIN
        SET @balanceTypeId = 1
    END

IF @balanceTypeId = 1 
    BEGIN            -- All non-zero
       DELETE FROM #TempInvoices WHERE ROUND([DocBalance], 2) = 0.00
    END 
ELSE IF @balanceTypeId = 2 
    BEGIN -- Greater than zero
       DELETE FROM #TempInvoices WHERE ROUND([DocBalance], 2) <= 0.00
    END 
ELSE IF @balanceTypeId = 3 
    BEGIN -- Less than zero
       DELETE FROM #TempInvoices WHERE ROUND([DocBalance], 2) >= 0.00
    END


UPDATE #TempInvoices SET PolicyStatusId = 1 WHERE PolicyStatusId NOT IN (2, 4, 5,7, 8, 11, 13)

IF (@debtorStatus = 1) 
     BEGIN
        DELETE FROM #TempInvoices WHERE PolicyStatusId != 1
     END 
ELSE IF (@debtorStatus = 2) 
	BEGIN
		DELETE FROM #TempInvoices WHERE PolicyStatusId = 1
	END



DROP INDEX IF EXISTS #TempInvoices_idx ON #TempInvoices
CREATE CLUSTERED INDEX #TempInvoices_idx ON #TempInvoices ([TransactionsInvoiceId],[AllocationInvoiceId])
SET @Msg = '1.1'  + ' : ' + CAST(DATEDIFF(SECOND,@Step,GETDATE()) AS VARCHAR(50)) + ' seconds. #TempInvoices  '
RAISERROR (@Msg, 10, 1) WITH NOWAIT

IF OBJECT_ID(N'tempdb..#TempInvoices3', N'U') IS NOT NULL
        DROP TABLE #TempInvoices3;

        SELECT  
        a.[Industry] AS [Class],
        Cast(a.[dr_yyyy]as varchar(255)) AS [dr_yyyy],
        Cast(a.[ControlNumber]as varchar(255)) AS [ControlNumber],
        Cast(a.[underwriting_yyyy]as varchar(255)) AS [underwriting_yyyy],
        Cast(a.[Product]as varchar(255)) AS [Product],
        Cast(a.[dr_no]as varchar(255)) AS [dr_no],
        Cast(a.[name]as varchar(255)) AS [name],
        Cast(a.[Type]as varchar(255)) AS [Type],
        Cast(a.[DocumentNo]as varchar(255)) AS [DocumentNo],
        a.[PolicyInceptionDate] AS [PolicyInceptionDate],
        a.[ProdOption] AS [ProductOptions],
        a.[ProductType] AS [ProductType],
        a.[BrokerName] AS [BrokerName],
        a.[PolicyHolderName] AS [PolicyHolderName],
        a.[Group] AS [Group],
        cast(sum(a.[DocBalance]) as float) AS [DocBalance],
        cast(max(a.[JAN-Invoice]) as float) AS [JAN_Invoice],
        cast(max(a.[JAN-Raised]) as float) AS [JAN_Raised],
        cast(sum(a.[JAN-Collect]) as float) AS [JAN_Collect],
        cast(sum(a.[JAN-Credit]) as float) AS [JAN_Credit],
        cast(max(a.[FEB-Invoice]) as float) AS [FEB_Invoice],
        cast(max(a.[FEB-Raised]) as float) AS [FEB_Raised],
        cast(sum(a.[FEB-Collect]) as float) AS [FEB_Collect],
        cast(sum(a.[FEB-Credit]) as float) AS [FEB_Credit],
        cast(max(a.[MAR-Invoice]) as float) AS [MAR_Invoice],
        cast(max(a.[MAR-Raised]) as float) AS [MAR_Raised],
        cast(sum(a.[MAR-Collect]) as float) AS [MAR_Collect],
        cast(sum(a.[MAR-Credit]) as float) AS [MAR_Credit],
        cast(max(a.[APR-Invoice]) as float) AS [APR_Invoice],
        cast(max(a.[APR-Raised]) as float) AS [APR_Raised],
        cast(sum(a.[APR-Collect]) as float) AS [APR_Collect],
        cast(sum(a.[APR-Credit]) as float) AS [APR_Credit],
        cast(max(a.[MAY-Invoice]) as float) AS [MAY_Invoice],
        cast(max(a.[MAY-Raised]) as float) AS [MAY_Raised],
        cast(sum(a.[MAY-Collect]) as float) AS [MAY_Collect],
        cast(sum(a.[MAY-Credit]) as float) AS [MAY_Credit],
        cast(max(a.[JUN-Invoice]) as float) AS [JUN_Invoice],
        cast(max(a.[JUN-Raised]) as float) AS [JUN_Raised],
        cast(sum(a.[JUN-Collect]) as float) AS [JUN_Collect],
        cast(sum(a.[JUN-Credit]) as float) AS [JUN_Credit],
        cast(max(a.[JUL-Invoice]) as float) AS [JUL_Invoice],
        cast(max(a.[JUL-Raised]) as float) AS [JUL_Raised],
        cast(sum(a.[JUL-Collect]) as float) AS [JUL_Collect],
        cast(sum(a.[JUL-Credit]) as float) AS [JUL_Credit],
        cast(max(a.[AUG-Invoice]) as float) AS [AUG_Invoice],
        cast(max(a.[AUG-Raised]) as float) AS [AUG_Raised],
        cast(sum(a.[AUG-Collect]) as float) AS [AUG_Collect],
        cast(sum(a.[AUG-Credit]) as float) AS [AUG_Credit],
        cast(max(a.[SEP-Invoice]) as float) AS [SEP_Invoice],
        cast(max(a.[SEP-Raised]) as float) AS [SEP_Raised],
        cast(sum(a.[SEP-Collect]) as float) AS [SEP_Collect],
        cast(sum(a.[SEP-Credit]) as float) AS [SEP_Credit],
        cast(max(a.[OCT-Invoice]) as float) AS [OCT_Invoice],
        cast(max(a.[OCT-Raised]) as float) AS [OCT_Raised],
        cast(sum(a.[OCT-Collect]) as float) AS [OCT_Collect],
        cast(sum(a.[OCT-Credit]) as float) AS [OCT_Credit],
        cast(max(a.[NOV-Invoice]) as float) AS [NOV_Invoice],
        cast(max(a.[NOV-Raised]) as float) AS [NOV_Raised],
        cast(sum(a.[NOV-Collect]) as float) AS [NOV_Collect],
        cast(sum(a.[NOV-Credit]) as float) AS [NOV_Credit],
        cast(max(a.[DEC-Invoice]) as float) AS [DEC_Invoice],
        cast(max(a.[DEC-Raised]) as float) AS [DEC_Raised],
        cast(sum(a.[DEC-Collect]) as float) AS [DEC_Collect],
        cast(sum(a.[DEC-Credit]) as float) AS [DEC_Credit],
        cast(sum(a.[Year1-Jan-Collect]) as float) AS [Year1_Jan_Collect],
        cast(sum(a.[Year1-Jan-Credit]) as float) AS [Year1_Jan_Credit],
        cast(sum(a.[Year1-Feb-Collect]) as float) AS [Year1_Feb_Collect],
        cast(sum(a.[Year1-Feb-Credit]) as float) AS [Year1_Feb_Credit],
        cast(sum(a.[Year1-Mar-Collect]) as float) AS [Year1_Mar_Collect],
        cast(sum(a.[Year1-Mar-Credit]) as float) AS [Year1_Mar_Credit],
        cast(sum(a.[Year1-Apr-Collect]) as float) AS [Year1_Apr_Collect],
        cast(sum(a.[Year1-Apr-Credit]) as float) AS [Year1_Apr_Credit],
        cast(sum(a.[Year1-May-Collect])  as float) AS [Year1_May_Collect],
        cast(sum(a.[Year1-May-Credit]) as float) AS [Year1_May_Credit],
        cast(sum(a.[Year1-Jun-Collect]) as float) AS [Year1_Jun_Collect],
        cast(sum(a.[Year1-Jun-Credit]) as float) AS [Year1_Jun_Credit],
        cast(sum(a.[Year1-Jul-Collect]) as float) AS [Year1_Jul_Collect],
        cast(sum(a.[Year1-Jul-Credit]) as float) AS [Year1_Jul_Credit],
        cast(sum(a.[Year1-Aug-Collect]) as float) AS [Year1_Aug_Collect],
        cast(sum(a.[Year1-Aug-Credit]) as float) AS [Year1_Aug_Credit],
        cast(sum(a.[Year1-Sep-Collect]) as float) AS [Year1_Sep_Collect],
        cast(sum(a.[Year1-Sep-Credit]) as float) AS [Year1_Sep_Credit],
        cast(sum(a.[Year1-Oct-Collect]) as float) AS [Year1_Oct_Collect],
        cast(sum(a.[Year1-Oct-Credit]) as float) AS [Year1_Oct_Credit],
        cast(sum(a.[Year1-Nov-Collect]) as float) AS [Year1_Nov_Collect],
        cast(sum(a.[Year1-Nov-Credit]) as float) AS [Year1_Nov_Credit],
        cast(sum(a.[Year1-Dec-Collect]) as float) AS [Year1_Dec_Collect],
        cast(sum(a.[Year1-Dec-Credit]) as float) AS [Year1_Dec_Credit],
        cast(sum(a.[Year2-Jan-Collect]) as float) AS [Year2_Jan_Collect],
        cast(sum(a.[Year2-Jan-Credit]) as float) AS [Year2_Jan_Credit],
        cast(sum(a.[Year2-Feb-Collect]) as float) AS [Year2_Feb_Collect],
        cast(sum(a.[Year2-Feb-Credit]) as float) AS [Year2_Feb_Credit],
        cast(sum(a.[Year2-Mar-Collect]) as float) AS [Year2_Mar_Collect],
        cast(sum(a.[Year2-Mar-Credit]) as float) AS [Year2_Mar_Credit],
        cast(sum(a.[Year2-Apr-Collect]) as float) AS [Year2_Apr_Collect],
        cast(sum(a.[Year2-Apr-Credit]) as float) AS [Year2_Apr_Credit],
        cast(sum(a.[Year2-May-Collect]) as float) AS [Year2_May_Collect],
        cast(sum(a.[Year2-May-Credit]) as float) AS [Year2_May_Credit],
        cast(sum(a.[Year2-Jun-Collect]) as float) AS [Year2_Jun_Collect],
        cast(sum(a.[Year2-Jun-Credit]) as float) AS [Year2_Jun_Credit],
        cast(sum(a.[Year2-Jul-Collect]) as float) AS [Year2_Jul_Collect],
        cast(sum(a.[Year2-Jul-Credit]) as float) AS [Year2_Jul_Credit],
        cast(sum(a.[Year2-Aug-Collect]) as float) AS [Year2_Aug_Collect],
        cast(sum(a.[Year2-Aug-Credit]) as float) AS [Year2_Aug_Credit],
        cast(sum(a.[Year2-Sep-Collect]) as float) AS [Year2_Sep_Collect],
        cast(sum(a.[Year2-Sep-Credit]) as float) AS [Year2_Sep_Credit],
        cast(sum(a.[Year2-Oct-Collect]) as float) AS [Year2_Oct_Collect],
        cast(sum(a.[Year2-Oct-Credit]) as float) AS [Year2_Oct_Credit],
        cast(sum(a.[Year2-Nov-Collect]) as float) AS [Year2_Nov_Collect],
        cast(sum(a.[Year2-Nov-Credit]) as float) AS [Year2_Nov_Credit],
        cast(sum(a.[Year2-Dec-Collect]) as float) AS [Year2_Dec_Collect],
        cast(sum(a.[Year2-Dec-Credit]) as float) AS [Year2_Dec_Credit],
        cast(sum(a.[Year3-Collect]) as float) AS [Year3_Collect],
        cast(sum(a.[Year3-Credit]) as float) AS [Year3_Credit],
        cast(sum(a.[Year4+Collect]) as float) AS [Year4_Plus_Collect],
        cast(sum(a.[Year4+Credit]) as float) AS [Year4_Plus_Credit]
INTO #TempInvoices3                   
FROM #TempInvoices a 
                                                                

GROUP BY  
        a.[Industry],
        a.[dr_yyyy],
        a.[ControlNumber],
        a.[underwriting_yyyy],
        a.[Product],
        a.[dr_no],
        a.[name],
        a.[DocumentNo],
        a.[PolicyInceptionDate],
        a.[ProdOption],
        a.[ProductType],
        a.[BrokerName],
        a.[PolicyHolderName],
        a.[Group],
        a.[Type]



DROP INDEX IF EXISTS #TempInvoices3_idx ON #TempInvoices3
CREATE CLUSTERED INDEX #TempInvoices3_idx ON #TempInvoices3 ([dr_yyyy],[Type],[dr_no])
SET @Msg = '1.4'  + ' : ' + CAST(DATEDIFF(SECOND,@Step,GETDATE()) AS VARCHAR(50)) + ' seconds. #TempInvoices3  '
RAISERROR (@Msg, 10, 1) WITH NOWAIT

                                                
SELECT * FROM #TempInvoices3


END
GO


