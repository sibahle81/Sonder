CREATE PROCEDURE [policy].[AmountInvoicedCLASSXIII]
AS 
BEGIN
		IF(OBJECT_ID('tempdb..#TempAmountInvoiced') Is Not Null)
		BEGIN
			DROP TABLE #TempAmountInvoiced
		END

		CREATE TABLE #TempAmountInvoiced
		(
			ROEStatus NVARCHAR(15),
			NumberOfMembers INT,
			PremiumAPI DECIMAL(18,2),
			NumberOfLives INT
		)

		INSERT INTO #TempAmountInvoiced(ROEStatus)
			VALUES ('Not Updated')

		INSERT INTO #TempAmountInvoiced(ROEStatus)
			VALUES ('Updated')

		DECLARE @UpdatedNoOfMembers INT = 0;
		DECLARE @UpdatedPremium DECIMAL(18,2) = 0;
		DECLARE @UpdatedNoOfLives INT = 0;
	
		DECLARE @NotUpdatedNoOfMembers  INT = 0;
		DECLARE @NotUpdatedPremium DECIMAL(18,2) = 0;
		DECLARE @NotUpdatedNoOfLives INT = 0;

		SET @NotUpdatedNoOfMembers = ISNULL((SELECT COUNT(*) 
									 FROM [client].[Declaration] INNER JOIN
									      [common].[DeclarationType] ON [common].[DeclarationType].[Id] = [client].[Declaration].[DeclarationTypeId] INNER JOIN
										  [client].[RolePlayer] ON [client].[RolePlayer].[RolePlayerId] = [client].[Declaration].[RolePlayerId] INNER JOIN
										  [client].[Company] ON [client].[Company].[RolePlayerId] = [client].[RolePlayer].[RolePlayerId] INNER JOIN
								          [policy].[Policy] ON [policy].[Policy].[PolicyOwnerId] = [client].[RolePlayer].[RolePlayerId] INNER JOIN
										  [billing].[Invoice] ON [billing].[Invoice].[PolicyId] =  [policy].[Policy].[PolicyId] INNER JOIN
										  [billing].[InvoiceAllocation] ON [billing].[InvoiceAllocation].[InvoiceId] = [billing].[Invoice].[InvoiceId]
									WHERE [common].[DeclarationType].[id] <> 2 AND [Company].[IndustryClassId] = 13),0)

		SET @NotUpdatedPremium = ISNULL((SELECT SUM([billing].[InvoiceAllocation].[Amount]) 
									 FROM [client].[Declaration] INNER JOIN
									      [common].[DeclarationType] ON [common].[DeclarationType].[Id] = [client].[Declaration].[DeclarationTypeId] INNER JOIN
										  [client].[RolePlayer] ON [client].[RolePlayer].[RolePlayerId] = [client].[Declaration].[RolePlayerId] INNER JOIN
										  [client].[Company] ON [client].[Company].[RolePlayerId] = [client].[RolePlayer].[RolePlayerId] INNER JOIN
								          [policy].[Policy] ON [policy].[Policy].[PolicyOwnerId] = [client].[RolePlayer].[RolePlayerId] INNER JOIN
										  [billing].[Invoice] ON [billing].[Invoice].[PolicyId] =  [policy].[Policy].[PolicyId] INNER JOIN
										  [billing].[InvoiceAllocation] ON [billing].[InvoiceAllocation].[InvoiceId] = [billing].[Invoice].[InvoiceId]
									WHERE [common].[DeclarationType].[id] <> 2 AND [Company].[IndustryClassId] = 13),0)

		SET @NotUpdatedNoOfLives = ISNULL((SELECT COUNT([policy].[PolicyInsuredLives].[PolicyId]) 
									 FROM [client].[Declaration] INNER JOIN
									      [common].[DeclarationType] ON [common].[DeclarationType].[Id] = [client].[Declaration].[DeclarationTypeId] INNER JOIN
										  [client].[RolePlayer] ON [client].[RolePlayer].[RolePlayerId] = [client].[Declaration].[RolePlayerId] INNER JOIN
										  [client].[Company] ON [client].[Company].[RolePlayerId] = [client].[RolePlayer].[RolePlayerId] INNER JOIN
								          [policy].[Policy] ON [policy].[Policy].[PolicyOwnerId] = [client].[RolePlayer].[RolePlayerId] INNER JOIN
										  [policy].[PolicyInsuredLives] ON [policy].[PolicyInsuredLives].[PolicyId] = [policy].[Policy].[PolicyId] INNER JOIN
										  [billing].[Invoice] ON [billing].[Invoice].[PolicyId] =  [policy].[Policy].[PolicyId] INNER JOIN
										  [billing].[InvoiceAllocation] ON [billing].[InvoiceAllocation].[InvoiceId] = [billing].[Invoice].[InvoiceId]
									WHERE [common].[DeclarationType].[id] <> 2 AND [Company].[IndustryClassId] = 13),0)

		
		UPDATE #TempAmountInvoiced
		SET NumberOfMembers = @NotUpdatedNoOfMembers,
		    PremiumAPI = @NotUpdatedPremium,
			NumberOfLives = @NotUpdatedNoOfLives
		WHERE ROEStatus = 'Not Updated'

		SET @UpdatedNoOfMembers = ISNULL((SELECT COUNT(*) 
									 FROM [client].[Declaration] INNER JOIN
									      [common].[DeclarationType] ON [common].[DeclarationType].[Id] = [client].[Declaration].[DeclarationTypeId] INNER JOIN
										  [client].[RolePlayer] ON [client].[RolePlayer].[RolePlayerId] = [client].[Declaration].[RolePlayerId] INNER JOIN
										  [client].[Company] ON [client].[Company].[RolePlayerId] = [client].[RolePlayer].[RolePlayerId] INNER JOIN
								          [policy].[Policy] ON [policy].[Policy].[PolicyOwnerId] = [client].[RolePlayer].[RolePlayerId] INNER JOIN
										  [billing].[Invoice] ON [billing].[Invoice].[PolicyId] =  [policy].[Policy].[PolicyId] INNER JOIN
										  [billing].[InvoiceAllocation] ON [billing].[InvoiceAllocation].[InvoiceId] = [billing].[Invoice].[InvoiceId]
									WHERE [common].[DeclarationType].[id] = 2 AND [Company].[IndustryClassId] = 13),0)

		SET @UpdatedPremium = ISNULL((SELECT SUM([billing].[InvoiceAllocation].[Amount]) 
									 FROM [client].[Declaration] INNER JOIN
									      [common].[DeclarationType] ON [common].[DeclarationType].[Id] = [client].[Declaration].[DeclarationTypeId] INNER JOIN
										  [client].[RolePlayer] ON [client].[RolePlayer].[RolePlayerId] = [client].[Declaration].[RolePlayerId] INNER JOIN
										  [client].[Company] ON [client].[Company].[RolePlayerId] = [client].[RolePlayer].[RolePlayerId] INNER JOIN
								          [policy].[Policy] ON [policy].[Policy].[PolicyOwnerId] = [client].[RolePlayer].[RolePlayerId] INNER JOIN
										  [billing].[Invoice] ON [billing].[Invoice].[PolicyId] =  [policy].[Policy].[PolicyId] INNER JOIN
										  [billing].[InvoiceAllocation] ON [billing].[InvoiceAllocation].[InvoiceId] = [billing].[Invoice].[InvoiceId]
									WHERE [common].[DeclarationType].[id] = 2 AND [Company].[IndustryClassId] = 13),0)

		SET @UpdatedNoOfLives = ISNULL((SELECT COUNT([policy].[PolicyInsuredLives].[PolicyId]) 
									 FROM [client].[Declaration] INNER JOIN
									      [common].[DeclarationType] ON [common].[DeclarationType].[Id] = [client].[Declaration].[DeclarationTypeId] INNER JOIN
										  [client].[RolePlayer] ON [client].[RolePlayer].[RolePlayerId] = [client].[Declaration].[RolePlayerId] INNER JOIN
										  [client].[Company] ON [client].[Company].[RolePlayerId] = [client].[RolePlayer].[RolePlayerId] INNER JOIN
								          [policy].[Policy] ON [policy].[Policy].[PolicyOwnerId] = [client].[RolePlayer].[RolePlayerId] INNER JOIN
										  [policy].[PolicyInsuredLives] ON [policy].[PolicyInsuredLives].[PolicyId] = [policy].[Policy].[PolicyId] INNER JOIN
										  [billing].[Invoice] ON [billing].[Invoice].[PolicyId] =  [policy].[Policy].[PolicyId] INNER JOIN
										  [billing].[InvoiceAllocation] ON [billing].[InvoiceAllocation].[InvoiceId] = [billing].[Invoice].[InvoiceId]
									WHERE [common].[DeclarationType].[id] = 2 AND [Company].[IndustryClassId] = 13),0)

	


		UPDATE #TempAmountInvoiced
		SET NumberOfMembers = @UpdatedNoOfMembers,
		    PremiumAPI = @UpdatedPremium,
			NumberOfLives = @UpdatedNoOfLives
		WHERE ROEStatus = 'Updated'

		SELECT * FROM #TempAmountInvoiced

	






END