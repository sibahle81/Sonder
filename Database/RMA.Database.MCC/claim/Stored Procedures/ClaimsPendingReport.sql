

Create PROCEDURE [claim].[ClaimsPendingReport]
	@DateFrom As DATE ='2022-06-06',
	@DateTo AS DATE='2023-06-06' 
AS
BEGIN	
	SELECT  DISTINCT C.[ClaimId]											[Id],
			ISNULL (C.[ModifiedDate], PE.[ModifiedDate])		[DatePended],
			ISNULL (C.claimreferencenumber, PE.Personeventreferencenumber)	[ClaimNumber], 
			PE.PersonEventId									[PersonEventNumber], 
			P.[PolicyNumber]									[PolicyNumber],
			CT.[Name]											[Channel],
			ET.[Name]											[EventType], 
			PO.name												[Product],
			PCT.[Description]									[Class],
			B.[Name]											[Brokerage],
			R.[Code]											[Broker],
			PPRP.[DisplayName]									[Scheme],  
			R.[SurnameOrCompanyName]							[CompanyName],
			U.[DisplayName]										[Assessor],
			ISNULL (CB.EstimatedValue  , BR.BenefitAmount)		[BenefitAmount],
			CS.Reason											[Reason],
			E.[DateAdvised] AS									[NotificationDate],	
			E.[CreatedDate] AS									[CapturedDate],
			bpm.[CalculateOverAllSLATimeElapsed](E.[CreatedDate],GETDATE()) as [Ageing],
	
			PLO.FirstName [MainMemberName],
			CN.[Text] [ClaimNote]
			FROM [claim].[Event] (NOLOCK) E 
			INNER JOIN [claim].[PersonEvent] (NOLOCK) PE ON E.EventId = PE.EventId
			INNER JOIN [common].[EventType] (NOLOCK) ET ON E.EventTypeId = ET.Id
			INNER JOIN [client].[RolePlayer](NOLOCK) RP ON RP.RolePlayerId = PE.ClaimantId
			INNER JOIN [common].[CommunicationType] (NOLOCK) CT ON RP.PreferredCommunicationTypeId = CT.Id			
			INNER JOIN [policy].[PolicyInsuredLives] (NOLOCK) PIL ON PE.InsuredLifeId = PIL.RolePlayerId
			INNER JOIN [policy].[Policy] (NOLOCK) P ON PIL.PolicyId = P.PolicyId
			INNER JOIN [product].[ProductOption] (NOLOCK)PO ON P.[ProductOptionId] = PO.[Id]
			INNER JOIN [product].[ProductOptionCoverType] (NOLOCK) POCT ON PO.[Id] = POCT.[ProductOptionId]
			INNER JOIN [common].[CoverType] (NOLOCK) PCT on POCT.[CoverTypeId] = PCT.[Id]
			INNER JOIN [broker].[brokerage] (NOLOCK) B ON P.BrokerageId = B.Id
			INNER JOIN [broker].[Representative] (NOLOCK) R ON P.RepresentativeId = R.Id
			INNER JOIN [product].[BenefitRate] (NOLOCK) BR ON BR.Id = 
			 (SELECT TOP 1 Id FROM [product].[BenefitRate]  (NOLOCK)
						WHERE  (BenefitId = PIL.StatedBenefitId)
						ORDER BY EffectiveDate DESC)
			LEFT JOIN [policy].[Policy](nolock) PP on P.ParentPolicyId = PP.PolicyId
			LEFT JOIN [client].[RolePlayer](nolock) PPRP on PP.PolicyOwnerId = PPRP.RolePlayerId
			INNER JOIN [claim].[Claim] (NOLOCK)C ON PE.PersonEventId = C.PersonEventId AND P.PolicyId = C.PolicyId
			LEFT JOIN [claim].[ClaimNote] (NOLOCK) CN ON CN.EventId = 
			(SELECT TOP 1 EventId FROM [claim].[ClaimNote] (NOLOCK) 
						WHERE (EventId = E.EventId)
						ORDER BY CreatedDate desc)
			LEFT JOIN [claim].[ClaimBenefit](NOLOCK) CB ON C.ClaimId = CB.ClaimId
			LEFT JOIN [claim].[ClaimStatus] (NOLOCK) cs ON C.ClaimStatusId = CS.ClaimStatusId	
			LEFT JOIN [security].[User](NOLOCK) U ON U.Id = c.AssignedToUserId
			LEFT JOIN [client].[person](NOLOCK)PERS ON  PERS.roleplayerid =  PE.InsuredLifeId
			INNER JOIN [client].[person](NOLOCK) PLO ON PLO.RolePlayerId = PP.PolicyOwnerId
				WHERE E.CreatedDate BETWEEN @DateFrom AND @DateTo 
			AND (CS.[Status] ='Pending' OR CS.ClaimStatusId in (1,2,35,20,23) OR CS.ClaimStatusId IS NULL)

END