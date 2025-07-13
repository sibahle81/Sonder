
CREATE PROCEDURE [claim].[PendingClaimsReport]
	@DateFrom As DATE,
	@DateTo AS DATE
AS
BEGIN	
	SELECT  DISTINCT C.[ClaimId]								[Id],
			GETDATE()											[CurrentDate],
			ISNULL (C.[ModifiedDate], PE.[ModifiedDate])		[DatePended],
			ISNULL (C.claimreferencenumber, PE.Personeventreferencenumber)	[ClaimNumber], 
			PE.[PersonEventId]									[PersonEventNumber], 
			P.[PolicyNumber]									[PolicyNumber],
			O.[DisplayName]										[PolicyHolder],
			CT.[Name]											[Channel],
			DT.[Name]											[TypeofDeath], 
			PO.[Name]											[Product],
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
			PERS.FirstName				[DeceasedName]	,
			PERS.Surname				[DeceasedSurname],
			PERS.IdNumber				[DeceasedIdNumber],

			CN.[Text] [ClaimNote]	
			FROM [claim].[Event] (NOLOCK) E 
			INNER JOIN [claim].[PersonEvent] (NOLOCK) PE ON E.EventId = PE.EventId
			INNER JOIN [claim].[PersonEventDeathDetail] (NOLOCK) PEDD ON PE.PersonEventId = PEDD.PersonEventId
			INNER JOIN [common].[DeathType] (NOLOCK) DT ON PEDD.DeathTypeId = DT.Id
			INNER JOIN [client].[RolePlayer](NOLOCK) RP ON RP.RolePlayerId = PE.ClaimantId
			LEFT JOIN [common].[CommunicationType] (NOLOCK) CT ON RP.PreferredCommunicationTypeId = CT.Id			
			INNER JOIN [policy].[PolicyInsuredLives] (NOLOCK) PIL ON PE.InsuredLifeId = PIL.RolePlayerId
			INNER JOIN [policy].[Policy] (NOLOCK) P ON PIL.PolicyId = P.PolicyId
			INNER JOIN [client].[RolePlayer](NOLOCK) O ON P.PolicyOwnerId = O.RolePlayerId
			INNER JOIN [claim].[Claim] (NOLOCK)C ON PE.PersonEventId = C.PersonEventId AND P.PolicyId = C.PolicyId
			LEFT JOIN [claim].[ClaimStatus] (NOLOCK) CS ON C.ClaimStatusId = CS.ClaimStatusId
			INNER JOIN [product].[ProductOption] (NOLOCK)PO ON P.[ProductOptionId] = PO.[Id]
			INNER JOIN [product].[ProductOptionCoverType] (NOLOCK) POCT ON PO.[Id] = POCT.[ProductOptionId]
			INNER JOIN [common].[CoverType] (NOLOCK) PCT on POCT.[CoverTypeId] = PCT.[Id]
			LEFT JOIN [broker].[brokerage] (NOLOCK) B ON P.BrokerageId = B.Id
			LEFT JOIN [broker].[Representative] (NOLOCK) R ON P.RepresentativeId = R.Id
			LEFT JOIN [product].[BenefitRate] (NOLOCK) BR ON BR.Id = 
			 (SELECT TOP 1 Id FROM [product].[BenefitRate]  (NOLOCK)
						WHERE  (BenefitId = PIL.StatedBenefitId)
						ORDER BY EffectiveDate DESC)
			LEFT JOIN [policy].[Policy](nolock) PP on P.ParentPolicyId = PP.PolicyId
			LEFT JOIN [client].[RolePlayer](nolock) PPRP on PP.PolicyOwnerId = PPRP.RolePlayerId
			LEFT JOIN [claim].[ClaimNote] (NOLOCK) CN ON CN.ClaimNoteId = 
			(SELECT TOP 1 ClaimNoteId FROM [claim].[ClaimNote] (NOLOCK) 
						WHERE (PersonEventId = PE.PersonEventId)
						ORDER BY CreatedDate desc)
			LEFT JOIN [claim].[ClaimBenefit](NOLOCK) CB ON C.ClaimId = CB.ClaimId and CB.IsDeleted = 0
			LEFT JOIN [security].[User](NOLOCK) U ON U.Id = c.AssignedToUserId
			LEFT JOIN [client].[person](NOLOCK) PERS ON  PERS.RolePlayerId =  PE.InsuredLifeId
			WHERE CONVERT(DATE,E.CreatedDate) BETWEEN @DateFrom AND @DateTo 
			AND (CS.[Status] ='Pending' OR CS.ClaimStatusId in (1,2,35,20,23) OR CS.ClaimStatusId IS NULL)
END


