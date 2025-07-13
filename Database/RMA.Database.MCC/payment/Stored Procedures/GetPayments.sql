CREATE PROCEDURE [payment].[GetPayments]
	@DateFrom DATE,
	@DateTo DATE,
	@PaymentTypeId INT=0,
	@ClaimTypeId INT = 0,
	@PaymentStatusId INT = 0,
	@Query NVARCHAR(50) = NULL
   
	WITH RECOMPILE
AS

 BEGIN
	 SELECT [P].[PaymentId],
	        [P].[ClaimId],
			[P].[PolicyId],
			[P].[RefundHeaderId],
			[P].[Bank],
			[P].[BankBranch],
			[P].[BankAccountTypeId],
			[P].[Reference] [Payment Reference],
			[P].[BatchReference] [Batch No],
			[P].[CreatedDate] [Authorised DATE],
			[P].[SubmissionDate] [Submission DATE],
			[P].[RejectionDate] [Rejection DATE], 
			[P].[PaymentConfirmationDate] [Payment DATE],
			[P].[ReconciliationDate] [Reconciliation DATE],
			[P].[ClientNotificationDate] [Client Notification DATE],
			[P].[Company],
			[P].[Branch],
			[P].[Product],
			[P].[PaymentTypeId],
			[P].[PaymentStatusId],
			[P].[ClaimTypeId],
			[P].[ClientTypeId],
			[P].[Payee] [Payee Details],
			[P].[ClaimReference] [Claim No],
			[P].[PolicyReference] [Policy No],
			[P].[Amount],
			[P].[AccountNo] [Account Details],
			[PRC].[BriefDescription] [Error Description],
			[P].[SENDerAccountNo],
			[BSE].[UserReference] [BankStatementReference],			
			[PPRP].[DisplayName] [Scheme],
			[B].Name [BrokerName],
			[P].[EmailAddress],
			[P].[IsReversed],
			[P].[CreatedBy],
			[P].[MaxSubmissionCount],
			[P].[SubmissionCount]
		FROM [payment].[payment] [P]
	
		LEFT JOIN [policy].[policy] [POL] (NOLOCK) ON [P].[PolicyId] = [POL].[Policyid]
		LEFT JOIN [product].[ProductOptionCoverType] [POCT] (NOLOCK) ON [POL].[ProductOptionId] = [POCT].[ProductOptionId]
		LEFT JOIN [common].[CoverType] [CT] (NOLOCK) ON [POCT].[CoverTypeId] = [CT].[Id]
		LEFT JOIN [policy].[Policy] [PP] (NOLOCK) ON [POL].[ParentPolicyId] = [PP].[PolicyId]
		LEFT JOIN [client].[roleplayer] [PPRP](NOLOCK) ON [PPRP].RolePlayerId = [PP].[policyOwnerId]
		LEFT JOIN [broker].[Brokerage] [B](NOLOCK) ON [POL].[BrokerageId] = [B].[Id]
		LEFT JOIN [policy].[Policy]	[PO](NOLOCK)  ON [P].PolicyId = [PO].PolicyId
		LEFT JOIN [client].[RolePlayer]	[R](NOLOCK) ON PO.PolicyPayeeId = R.RolePlayerId
		LEFT JOIN [client].[FinPayee](NOLOCK) [F] ON [R].RolePlayerId = [F].RolePlayerId
		LEFT JOIN [payment].[PaymentRejectionCode] [PRC] (NOLOCK) ON P.[ErrorCode] = [PRC].[Code] AND  [PRC].[IsDeleted] = 0 AND [PRC].[IsActive] = 1
		LEFT JOIN [payment].[FacsTransactionResults] [FACS] (NOLOCK) ON [FACS].[PaymentId] = [P].[PaymentId] and [FACS].[IsActive]=1
		LEFT JOIN [finance].[BankStatementEntry] [BSE] (NOLOCK) ON Convert(INT,[BSE].[RequisitionNumber ]) = Convert(INT,[FACS].[RequisitionNumber ]) AND [BSE].[UserReference2] = [FACS].[Reference2]
		
		WHERE  
			[P].[IsDeleted] = 0
			AND
			@DATEFROM <= CASE WHEN @PaymentStatusId = 2 THEN CAST([P].[SubmissionDate] AS DATE)
							  WHEN @PaymentStatusId = 3 OR @PaymentStatusId = 5  THEN CAST([P].[PaymentConfirmationDate] AS DATE) 
							  WHEN @PaymentStatusId = 4 THEN CAST([P].[RejectionDate] AS DATE)
			ELSE CAST([P].[CreatedDate] AS DATE) 
			END
			AND 
			@DATETO >= CASE WHEN @PaymentStatusId = 2 THEN CAST([P].[SubmissionDate] AS DATE)
							WHEN @PaymentStatusId = 3 OR @PaymentStatusId = 5  THEN CAST([P].[PaymentConfirmationDate] AS DATE) 
							WHEN @PaymentStatusId = 4 THEN CAST([P].[RejectionDate] AS DATE)
			ELSE CAST([P].[CreatedDate] AS DATE)
			END
			AND
			[P].[PaymentTypeId] <> CASE WHEN @PaymentTypeId = 0 THEN 16 ELSE 0 END
			AND
			@PaymentTypeId = CASE WHEN @PaymentTypeId = 0 THEN 0				
					ELSE [P].[PaymentTypeId]
					END	
			AND
			@ClaimTypeId = CASE WHEN @ClaimTypeId = 0 THEN 0
							ELSE [P].[ClaimTypeId]
							END
			AND  
			@PaymentStatusId = CASE WHEN @PaymentStatusId = 0 THEN 0	
									WHEN @PaymentStatusId = 9 THEN 9		
					ELSE [P].[PaymentStatusId]
					END
			AND
			[P].[IsReversed] = CASE WHEN @PaymentStatusId = 9 THEN 1											
					ELSE [P].[IsReversed]
					END

			AND 
			(
				[P].[ClaimReference] LIKE CASE WHEN @Query IS NOT NULL THEN '%'+@Query+'%' ELSE [P].[ClaimReference] END
				OR
				[P].[PolicyReference] LIKE CASE WHEN @Query IS NOT NULL THEN '%'+@Query+'%' ELSE [P].[PolicyReference] END
				OR
				[P].[Reference] LIKE CASE WHEN @Query IS NOT NULL THEN '%'+@Query+'%' ELSE [P].[Reference] END
				OR
				[P].[BatchReference] LIKE CASE WHEN @Query IS NOT NULL THEN '%'+@Query+'%' ELSE [P].[BatchReference] END
				OR
				[P].[Payee] LIKE CASE WHEN @Query IS NOT NULL THEN '%'+@Query+'%' ELSE [P].[Payee] END
				OR
				[P].[IdNumber] LIKE CASE WHEN @Query IS NOT NULL THEN '%'+@Query+'%' ELSE [P].[IdNumber] END
				OR
				[P].[AccountNo] LIKE CASE WHEN @Query IS NOT NULL THEN '%'+@Query+'%' ELSE [P].[AccountNo] END
				OR
				[B].[Name] LIKE CASE WHEN @Query IS NOT NULL THEN '%'+@Query+'%' ELSE [B].[Name] END
				OR
				[PPRP].[DisplayName] LIKE CASE WHEN @Query IS NOT NULL THEN '%'+@Query+'%' ELSE [PPRP].[DisplayName] END
				OR
				[B].[Code] LIKE CASE WHEN @Query IS NOT NULL THEN '%'+@Query+'%' ELSE [B].[Code] END
				OR
				[F].[FinPayeNumber] LIKE CASE WHEN @Query IS NOT NULL THEN '%'+@Query+'%' ELSE [F].[FinPayeNumber] END
				OR
				[P].[Product] LIKE CASE WHEN @Query IS NOT NULL THEN '%'+@Query+'%' ELSE [P].[Product] END
				)
			
			Group By [P].[PaymentId],
					 [P].[ClaimId],
					 [P].[PolicyId],
					 [P].[RefundHeaderId],
					 [P].[Bank],
					 [P].[BankBranch],
					 [P].[BankAccountTypeId],
					 [P].[Reference],
					 [P].[BatchReference],
					 [P].[CreatedDate],
					 [P].[SubmissionDate],
					 [P].[RejectionDate],
					 [P].[PaymentConfirmationDate],
					 [P].[ReconciliationDate],
					 [P].[ClientNotificationDate],
					 [P].[Company],
					 [P].[Branch],
					 [P].[Product],
					 [P].[PaymentTypeId],
					 [P].[PaymentStatusId],
					 [P].[ClaimTypeId],
					 [P].[ClientTypeId],
					 [P].[Payee],
					 [P].[ClaimReference],
					 [P].[PolicyReference],
					 [P].[Amount],
					 [P].[AccountNo],
					 [PRC].[BriefDescription],
					 [P].[SENDerAccountNo],
					 [BSE].[UserReference],		
					 [PPRP].[DisplayName],
					 [B].[Name],
					 [P].[EmailAddress],
					 [P].[IsReversed],
					 [P].[CreatedBy],
					 [P].[MaxSubmissionCount],
					 [P].[SubmissionCount]
		    ORDER BY [P].[PaymentId] ASC
END
