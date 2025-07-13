-- =============================================
-- Author:		Gram Letoaba
-- Create date: 2021/07/01
-- EXEC [billing].[ProcessEuropeAssistPremiums]
-- =============================================
CREATE   PROCEDURE [billing].[ProcessEuropeAssistPremiums]
AS
BEGIN

		DECLARE @EuropAssistRMAPremium Decimal(18,2)
		SET @EuropAssistRMAPremium = (SELECT [BasePremium] + [ProfitExpenseLoadingPremium] FROM [common].[EuropAssistPremiumMatrix] WHERE ([EndDate] > GetDate() OR [EndDate] IS NULL) AND IsDeleted = 0)

		

		INSERT INTO [billing].[Transactions] 
				   ([InvoiceId]
				   ,[RolePlayerId]
				   ,[BankStatementEntryId]
				   ,[TransactionTypeLinkId]
				   ,[Amount]
				   ,[TransactionDate]
				   ,[BankReference]
				   ,[TransactionTypeId]
				   ,[CreatedDate]
				   ,[ModifiedDate]
				   ,[CreatedBy]
				   ,[ModifiedBy]
				   ,[Reason]
				   ,[RmaReference]
				   ,[LinkedTransactionId]
				   ,[ClaimRecoveryInvoiceId]
				   ,[IsLogged]
				   ,[AdhocPaymentInstructionId]
				   ,[IsReAllocation]
				   ,[Balance]
				   ,[PremiumListingTransactionId])
			 SELECT  NULL InvoiceId
			        ,P.PolicyPayeeId
					, NULL [BankStatementEntryId]
				    ,2 [TransactionTypeLinkId]
					,SUM([policy].[GetEuropAssistFee](P.CommissionPercentage))
					,ISNULL(I.[PaymentDate],GetDate())
					,P.PolicyNumber [BankReference]
					,(SELECT Id FROM [common].[TransactionType] WHERE Name = 'Europ Assist Premium')
					,GetDate()
					,GetDate()
					,'system@randmutual.co.za'
					,'system@randmutual.co.za'
					,'Europ Assist Premium'
					,P.PolicyNumber
					,NULL
					,NULL
					,NULL
					,NULL
					,NULL
					,SUM([policy].[GetEuropAssistFee](P.CommissionPercentage))
					,I.Id
			FROM [billing].[PremiumListingTransaction] I INNER JOIN [policy].[Policy] P ON I.PolicyId = P.PolicyId
			WHERE P.IsEuropAssist = 1 AND I.[InvoiceStatusId] = 1
			AND I.Id NOT IN (SELECT [PremiumListingTransactionId] FROM [billing].[Transactions] WHERE [TransactionTypeId] = 20)
			GROUP BY PolicyPayeeId,I.[PaymentDate],P.PolicyNumber,I.Id,P.CommissionPercentage


			DECLARE @SearchTable TABLE (
			Id INT,
			TransactionId INT
			);

			INSERT INTO @SearchTable
			SELECT ROW_NUMBER() OVER (ORDER BY [TransactionId]) ,[TransactionId] FROM [billing].[AbilityTransactionsAudit] WHERE Item IN ('Europ Assist Premium','Invoice','Receipts','Credit Note') AND IsActive = 0
			
			UPDATE [billing].[AbilityTransactionsAudit] SET Reference = [dbo].[GenerateAuditReference](TransactionId), IsActive = 1
			WHERE TransactionId IN (SELECT TransactionId FROM @SearchTable) AND ([dbo].[GenerateAuditReference](TransactionId)) IS NOT NULL

END