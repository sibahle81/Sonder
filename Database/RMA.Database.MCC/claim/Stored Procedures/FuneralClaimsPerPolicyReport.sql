CREATE PROCEDURE [claim].[FuneralClaimsPerPolicyReport] 
       @DateFrom Date, 
       @DateTo Date
	   WITH RECOMPILE
AS
BEGIN

SELECT        [P].[PolicyNumber],    
              [P].[ClientReference],    
              [P].[PolicyInceptionDate],    
              [CT].[Description] [Class],    
              [IC].[Name] [IndustryClass],    
              [PO].[Name] [ProductOptions],    
              [RPPO].[DisplayName] [Group],    
              [RPO].[DisplayName] [PolicyHolder],    
              [client].[GetGender](DP.[IdNumber]) [Gender],    
              DATEDIFF(YEAR,[DP].[DateOfBirth] ,GETDATE()) [Age],    
              [RPT].[Name] [DeceasedRelationship],   
			  cast([E].[EventDate] as date) [DateOfDeath],
              [COD].[Description] [CauseofDeath],    
              [CID].[Name] [DeclineReason],    
              [B].[Name] [BrokerName],
			  ISNULL([C].[PersonEventId], [PE].[PersonEventId]) [ClaimNumber],
              ISNULL([CS].[Reason] ,'New') [ClaimStatus],    
              [PE].[DateReceived],  
			  (SELECT TOP 1 [U].[DisplayName] FROM [security].[User](NOLOCK) [U] WHERE [U].[Id] = [PE].[CapturedByUserId]) [ReceivedBy],	
              [C].[CreatedDate] [DateCaptured],   
			  (SELECT TOP 1 [U].[DisplayName] FROM [security].[User](NOLOCK) [U] WHERE [U].[Email] = [C].[CreatedBy]) [CapturedBy],
              (SELECT TOP 1 [StartDateTime] FROM [claim].[ClaimWorkflow] WHERE claimId = [C].[ClaimId] AND [ClaimstatusId] = 4 ORDER BY [StartDateTime] DESC) [DatePended],    
			  (SELECT TOP 1 [U].[DisplayName] 
				FROM [claim].[ClaimWorkflow] (NOLOCK) [WF] 
				LEFT JOIN [security].[User] (NOLOCK) [U] ON [WF].[AssignedToUserId] = [U].[Id]
				WHERE [WF].[ClaimId]  = [C].[ClaimId] AND [WF].[ClaimStatusId] = 4
				ORDER BY [WF].[ClaimWorkflowId] DESC) [PendedBy],	
              (SELECT TOP 1 [StartDateTime] FROM [claim].[ClaimWorkflow] WHERE claimId = [C].[ClaimId] AND [ClaimStatusId] = 10 ORDER BY [StartDateTime] DESC) [DateRepudiated],  
			  (SELECT TOP 1 [U].[DisplayName] 
				FROM [claim].[ClaimWorkflow] (NOLOCK) [WF] 
				LEFT JOIN [security].[User] (NOLOCK) [U] ON [WF].[AssignedToUserId] = [U].[Id]
				WHERE [WF].[ClaimId]  = [C].[ClaimId] AND [WF].[ClaimStatusId] = 10
				ORDER BY [WF].[ClaimWorkflowId] DESC) [RepudiatedBy],	
              [CI].[DateApproved],
			  (SELECT TOP 1 [U].[DisplayName] 
				FROM [claim].[ClaimWorkflow] (NOLOCK) [WF] 
				LEFT JOIN [security].[User] (NOLOCK) [U] ON [WF].[AssignedToUserId] = [U].[Id]
				WHERE [WF].[ClaimId]  = [C].[ClaimId] AND [WF].[ClaimStatusId] = 13
				ORDER BY [WF].[ClaimWorkflowId] DESC) [ApprovedBy],				  
              [PMT].[CreatedDate] [DateAuthorised],   
			  (SELECT TOP 1 [U].[DisplayName] 
				FROM [claim].[ClaimWorkflow] (NOLOCK) [WF] 
				LEFT JOIN [security].[User] (NOLOCK) [U] ON [WF].[AssignedToUserId] = [U].[Id]
				WHERE [WF].[ClaimId]  = [C].[ClaimId] AND [WF].[ClaimStatusId] = 14
				ORDER BY [WF].[ClaimWorkflowId] DESC) [AuthorisedBy],				
              [PMT].[PaymentConfirmationDate] [DatePaid],
			  (SELECT TOP 1 [U].[DisplayName]
				FROM [audit].[AuditLog](NOLOCK) [A]
				LEFT JOIN [security].[User] (NOLOCK) [U] ON JSON_VALUE([A].[OldItem],'$.ModifiedBy') = [U].[Email]
				WHERE [A].[ItemId] = [PMT].[PaymentId] AND [A].[ItemType] = 'payment_Payment' AND  JSON_VALUE([A].[OldItem],'$.PaymentStatus')  = 3) [PaidBy],
              [CalculatedClaimAmount] = ISNULL((SELECT TOP 1 [TotalAmount] FROM [Claim].[ClaimsCalculatedAmount] WHERE [ClaimId] = [C].[ClaimId]),[BR].[BenefitAmount]),    
              [AuthorisedClaimAmount] = ISNULL(ISNULL([CI].[AuthorisedAmount],[CI].[InvoiceAmount]),0),  
              [DP].[FirstName],  
              [DP].[Surname],  
              [DP].[IdNumber]     
			FROM [claim].[Event] (NOLOCK) [E] 
				INNER JOIN [claim].[PersonEvent] (NOLOCK) [PE] ON [E].[EventId] = [PE].[EventId] AND [PE].[PersonEventStatusId] <> 4
				INNER JOIN [claim].[PersonEventDeathDetail] (NOLOCK) [PEDD] ON [PE].[PersonEventId] = [PEDD].[PersonEventId]
				LEFT JOIN [common].[CauseOfDeathType] (NOLOCK) [COD] ON [PEDD].[Causeofdeath] = [COD].[Id]
				INNER JOIN [client].[Person] (NOLOCK) [DP] ON [PE].[InsuredLifeId] = [DP].[RolePlayerId]			
				INNER JOIN [policy].[PolicyInsuredLives] (NOLOCK) [PIL] ON [PE].[InsuredLifeId] = [PIL].[RolePlayerId]
				INNER JOIN [client].[RolePlayerType] [RPT] ON [PIL].[RolePlayerTypeId] = [RPT].[RolePlayerTypeId] 
				INNER JOIN [policy].[Policy] (NOLOCK) [P] ON [PIL].[PolicyId] = [P].[PolicyId]
				INNER JOIN [product].[BenefitRate] (NOLOCK) [BR] ON [BR].[Id] = 
				(SELECT TOP 1 [Id] FROM [product].[BenefitRate]  (NOLOCK)
						WHERE  (BenefitId = [PIL].[StatedBenefitId])
						ORDER BY [EffectiveDate] DESC) 
				INNER JOIN [product].[ProductOption] (NOLOCK) [PO] ON [P].[ProductOptionId] = [PO].[Id]
				INNER JOIN [product].[ProductOptionCoverType] (NOLOCK) [POCT] ON [PO].[Id] = [POCT].[ProductOptionId]
				INNER JOIN [common].[CoverType] (NOLOCK) [CT] ON [POCT].[CoverTypeId] = [CT].[Id]
				INNER JOIN [client].[RolePlayer] (NOLOCK) [RPO] ON [P].[PolicyOwnerId] = [RPO].[RolePlayerId]
				INNER JOIN [broker].[Brokerage] (NOLOCK) [B] ON [P].[BrokerageId] = [B].[Id]
				LEFT JOIN [claim].[Claim] (NOLOCK) [C] ON [PE].[PersonEventId] = C.PersonEventId AND [P].[PolicyId] = [C].[PolicyId]
				LEFT JOIN [claim].[ClaimStatus] (NOLOCK) [CS] ON [C].[ClaimStatusId] = [CS].[ClaimStatusId]
				LEFT JOIN [claim].[ClaimInvoice] (NOLOCK) [CI] ON C.[ClaimId] = [CI].[ClaimId] AND [CI].[IsDeleted] = 0
				LEFT JOIN [claim].[FuneralInvoice] (NOLOCK) [FI] ON [CI].[ClaimInvoiceId] = [FI].[ClaimInvoiceId]
				LEFT JOIN [payment].[Payment] (NOLOCK) [PMT] ON [C].[ClaimId] = [PMT].[ClaimId] AND [PMT].[PaymentConfirmationDate] IS NOT NULL
				LEFT JOIN [policy].[Policy] (NOLOCK) [PP] ON [P].[ParentPolicyId] = [PP].[PolicyId]
				LEFT JOIN [client].[RolePlayer] (NOLOCK) [RPPO] ON [PP].[PolicyOwnerId] = [RPPO].[RolePlayerId]
				LEFT JOIN [client].[FinPayee] (NOLOCK) [FP] ON [PP].[PolicyOwnerId]  = [FP].[RolePlayerId]			
				LEFT JOIN [common].[Industry] (NOLOCK) [I] ON [FP].[IndustryId] = [I].[Id]
				LEFT JOIN [common].[IndustryClass] (NOLOCK)[IC] ON [IC].[Id] = [I].[IndustryClassId]
				LEFT JOIN [common].[ClaimInvoiceDeclineReason] (NOLOCK) [CID] ON [CID].[Id] = [FI].[ClaimInvoiceDeclineReasonId]  
WHERE CONVERT(DATE,[E].[CreatedDate]) BETWEEN @DateFrom AND @DateTo
ORDER BY [PE].[DateReceived]
END