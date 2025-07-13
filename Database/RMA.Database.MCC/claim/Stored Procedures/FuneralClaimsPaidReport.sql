-- =============================================
-- Author:		Sanele Ngidi
-- Create date: 2019-10-16
-- Description:	[claim].[FuneralClaimsPaidReport] '2017-01-01','2021-06-18','Above 30K','ALL','ALL'
-- =============================================
CREATE PROCEDURE [claim].[FuneralClaimsPaidReport]
	@DateFrom DATE,
	@DateTo DATE,
	@Product VARCHAR(225),	
	@Brokerage VARCHAR(225),
	@Scheme VARCHAR(225)
    WITH RECOMPILE
AS
BEGIN
		 SELECT [COM].[Name]								[Channel],
			(SELECT TOP 1 [U].[DisplayName] 
				FROM [claim].[ClaimWorkflow] (NOLOCK) [WF] 
				JOIN [security].[User] (NOLOCK) [U] ON [WF].[AssignedToUserId] = [U].[Id]
				WHERE [WF].[ClaimId]  = [C].ClaimId AND [WF].[ClaimStatusId] = 14
				ORDER BY [WF].[ClaimWorkflowId] DESC)	[Assessor],
			[PRS].[FirstName]							[DeceasedName]	,
			[PRS].[Surname]								[DeceasedSurname],
			[PRS].[DateOfBirth]	    					[DeceasedDateOfBirth],
            [client].[GetGender]([PRS].[IdNumber])		[DeceasedGender],
			[PRS].[IdNumber]							[DeceasedIdNumber],
			[PO].[Name]									[ProductOption],
			[PRD].[Name]								[Product],
			[POL].[PolicyNumber]						[PolicyNumber],
			[CT].[Description]							[Class], 
			[DT].[Name]									[TypeOfDeath],
			[B].[Name]									[Brokerage],
			[CCA].[TotalAmount]							[BenefitAmount],
			[PMT].[PaymentConfirmationDate]				[DatePaid],				
			[PMT].[Payee]								[BeneficiaryName],
			[PMT].[Bank]								[BankAccountName],
			[PMT].[AccountNo]							[BankAccountNumber],
			[PMT].[BankBranch]							[BranchCode],
			[RPT].[Name]								[RelationshipToMainmember],
			[MMRP].[DisplayName]						[MainMember],
			''											[RefundsToRMA],
			''				        					[UnclaimedBenefitInterest],
			[PMT].[Amount]								[AmountPaid],
			''          								[UnmetPremiumDeduction],
			[DT].[Name]									[CauseOfDeath],
			[PEDD].[DeathDate]							[DateOfDeath]	,
			[REP].[Code]								[Broker],
			[PRP].[DisplayName]							[Scheme],
			[REP].[SurnameOrCompanyName]				[CompanyName]	,
			[POL].[PolicyInceptionDate]					[DateOfCommencement],
			ISNULL ([C].[ClaimReferenceNumber], [PE].[PersoneventReferenceNumber])	[ClaimNumber]	
			FROM [claim].[Claim](NOLOCK) [C]
			INNER JOIN [claim].[PersonEvent](NOLOCK) [PE] ON [C].[PersonEventId] = [PE].[PersonEventId] 
			INNER JOIN [claim].[PersonEventDeathDetail] (NOLOCK) [PEDD] ON  [C].[PersonEventId] = [PEDD].[PersonEventId]
			INNER JOIN [common].[DeathType](NOLOCK) [DT] ON [PEDD].[DeathTypeId] = [DT].[Id]
			INNER JOIN [policy].[Policy] (NOLOCK) [POL] ON [C].[PolicyId] = [POL].[PolicyId]
		    INNER JOIN [Payment].[Payment] (NOLOCK) [PMT] ON [C].[ClaimId] =[PMT].[ClaimId] 
			INNER JOIN [client].[Person](NOLOCK)[PRS] ON  [PE].[InsuredLifeId] = [PRS].[RolePlayerId]  
			INNER JOIN [product].[ProductOption](NOLOCK) [PO] ON [POL].[ProductOptionId] = [PO].[Id] 
			INNER JOIN [product].[Product](NOLOCK) [PRD] ON [PO].[ProductId] = [PRD].[Id]
			INNER JOIN [client].[Roleplayer](NOLOCK)[RP] ON [PE].[InsuredLifeId] = [RP].[RolePlayerId] 
			INNER JOIN [policy].[PolicyInsuredLives](NOLOCK) [PIL] ON [PE].[InsuredLifeId] = [PIL].[RolePlayerId] AND [C].[PolicyId] = [PIL].[PolicyId]
			INNER JOIN [client].[RolePlayerType](NOLOCK) [RPT] ON [PIL].[RolePlayerTypeId] = [RPT].[RolePlayerTypeId] 
			INNER JOIN [claim].[ClaimsCalculatedAmount](NOLOCK) [CCA] ON [C].[ClaimId] = [CCA].[ClaimId] and [CCA].[IsDeleted] = 0
			INNER JOIN [product].[ProductOptionCoverType](NOLOCK) [POCT] ON [PO].[Id] = [POCT].[ProductOptionId]
			INNER JOIN [common].[CoverType](NOLOCK) [CT] ON [POCT].[CoverTypeId] = [CT].[Id]
			LEFT JOIN [policy].[Policy](NOLOCK) [PP] ON [POL].[ParentPolicyId] = [PP].[PolicyId]
			LEFT JOIN [client].[Roleplayer](NOLOCK) [PRP] ON [PP].[PolicyOwnerId] = [PRP].[RolePlayerId]
			LEFT JOIN [broker].[Brokerage](NOLOCK) [B] ON [POL].[BrokerageId] = [B].[Id]
			LEFT JOIN [broker].[Representative](NOLOCK)[REP] ON [POL].[RepresentativeId] = [REP].[Id]  
			LEFT JOIN [common].[CommunicationType](NOLOCK) [COM] ON [RP].PreferredCommunicationTypeId = [COM].[Id]
			OUTER APPLY 
			(
			SELECT TOP 1 * FROM [policy].[policyInsuredLives](NOLOCK)
									WHERE [C].[PolicyId] = [PolicyId] AND [RolePlayerTypeId] = 10 
									AND [InsuredLifeStatusId] = CASE WHEN [InsuredLifeStatusId] = 1 THEN 1 ELSE 2 END
			) [PILMM]
			LEFT JOIN [Client].[RolePlayer](NOLOCK) [MMRP] ON [PILMM].[RolePlayerId] = [MMRP].[RolePlayerId]		
			WHERE
			[C].ClaimStatusId = 9 
			AND 
			CONVERT(DATE,[C].[CreatedDate]) BETWEEN @DateFrom AND @DateTo
			AND
			@Product = CASE WHEN @Product = 'All' THEN 'All'
					ELSE [PRD].[Name]
					END
			AND
			@Brokerage = CASE WHEN @Brokerage = 'All' THEN 'All'
					ELSE [B].[Name]
					END
			AND
			@Scheme = CASE WHEN  @Scheme = 'All' THEN 'All'
					ELSE [PRP].[DisplayName]
					END		
			ORDER BY [PMT].[PaymentConfirmationDate] DESC

END
