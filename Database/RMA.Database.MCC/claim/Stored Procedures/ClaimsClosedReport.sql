
CREATE PROCEDURE [claim].[ClaimsClosedReport]
	@DateFrom As varchar(20),
	@DateTo AS varchar(20),
	@Product VARCHAR(MAX),	
	@Brokerage AS VARCHAR(MAX),
	@Scheme AS VARCHAR(MAX)
AS
BEGIN

	DECLARE  @SQLQUERY NVARCHAR(MAX)

	 SET @SQLQUERY ='
	
SELECT		C.CreatedDate				[RegistrationDate],
			PE.DateCaptured				[DateCaptured],
			ISNULL (C.claimreferencenumber, PE.Personeventreferencenumber)	[ClaimNumber],
			CNL.[Name]					[Channel],
			ISNULL (CWFU.DisplayName, U.DisplayName)	[Assessor],
			PRS.FirstName				[DeceasedName],
			PRS.Surname					[DeceasedSurname],
			PRD.[Name]					[ProductType],
			P.PolicyNumber				[PolicyNumber]	,
			DT.[Name]					[TypeOfDeath],
			PEDD.DeathDate				[DateOfDeath]	,
			ISNULL(CCA.TotalAmount,BR.BenefitAmount)[BenefitAmount],
			B.[Name]					[Brokerage],
			R.Code						[Broker],
			PPRP.DisplayName			[Scheme],
			R.SurnameOrCompanyName		[CompanyName],
			CASE
				WHEN CN.Reason IS NOT NULL THEN CN.Reason
				WHEN PE.PersonEventStatusId = 2 THEN ''Closed''
				WHEN PE.PersonEventStatusId = 4 THEN ''Cancelled''
			END [Reason],
			ISNULL(ISNULL(CWF.EndDateTime,C.ClaimStatusChangeDate),PE.ModifiedDate) [ClosedDate],
			bpm.[CalculateOverAllSLATimeElapsed](PE.DateCaptured,ISNULL(ISNULL(CWF.EndDateTime,C.ClaimStatusChangeDate),PE.ModifiedDate)) AS [Ageing]
			FROM [claim].[PersonEvent](NOLOCK) PE
			INNER JOIN [claim].[PersonEventDeathDetail] (NOLOCK) PEDD ON PEDD.PersonEventId = PE.PersonEventId
			INNER JOIN [common].[DeathType] (NOLOCK) DT ON PEDD.DeathTypeId = DT.Id			
			INNER JOIN [policy].PolicyInsuredLives (NOLOCK) PIL ON PE.InsuredLifeId = PIL.RolePlayerId
			INNER JOIN [policy].[Policy] (NOLOCK) P ON PIL.PolicyId = P.PolicyId
			INNER JOIN [client].[person] (NOLOCK) PRS ON PRS.RolePlayerId = PE.InsuredLifeId
			INNER JOIN [product].[ProductOption] (NOLOCK) PO ON PO.id = P.ProductOptionId
			INNER JOIN [product].[Product] (NOLOCK) PRD ON PO.ProductId = PRD.Id
			INNER JOIN [client].[RolePlayer](NOLOCK)RP ON RP.RolePlayerId = PE.InsuredLifeId			
			INNER JOIN [broker].[Brokerage] (NOLOCK) B ON B.Id = P.BrokerageId
			LEFT JOIN [claim].[Claim]  (NOLOCK) C ON PE.PersonEventId = C.PersonEventId AND C.PolicyId = P.PolicyId--
			LEFT JOIN [common].[CommunicationType](NOLOCK) CNL ON CNL.Id = RP.PreferredCommunicationTypeId
			LEFT JOIN [broker].[Representative] (NOLOCK)R ON P.RepresentativeId = R.Id			
			LEFT JOIN [security].[User](NOLOCK) U ON U.Id = C.AssignedToUserId			
			LEFT JOIN [policy].[Policy](NOLOCK) PP ON P.ParentPolicyId = PP.PolicyId
			LEFT JOIN [client].[roleplayer] (NOLOCK)PPRP ON PPRP.RolePlayerId = PP.policyOwnerId
			LEFT JOIN [product].[BenefitRate] (NOLOCK) BR ON BR.Id = 
			 (SELECT TOP 1 Id FROM [product].[BenefitRate]  (NOLOCK)
						WHERE  (BenefitId = PIL.StatedBenefitId)
						ORDER BY EffectiveDate DESC) 
			LEFT JOIN [claim].[ClaimsCalculatedAmount] CCA ON C.ClaimId	= CCA.ClaimId 
			LEFT JOIN [claim].[ClaimWorkFlow] CWF ON CWF.ClaimWorkflowId = (SELECT TOP 1 ClaimWorkflowId FROM [claim].[ClaimWorkFlow] (NOLOCK)
						WHERE  (PersonEventId = PE.PersonEventId OR ClaimId = C.ClaimId)
						ORDER BY EndDateTime DESC) 
			LEFT JOIN [security].[User](NOLOCK) CWFU ON CWF.AssignedToUserId = CWFU.Id 
			LEFT JOIN [claim].[ClaimNote] CN ON CN.ClaimNoteId = (SELECT TOP 1 ClaimNoteId FROM [claim].[ClaimNote](NOLOCK)
						WHERE ((PersonEventStatusId = 2 OR PersonEventStatusId = 4) OR (ClaimStatusId = 6 OR ClaimStatusId = 7) OR (Reason IS NOT NULL)) AND (PersonEventId = PE.PersonEventId OR ClaimId = C.ClaimId)
						ORDER BY CreatedDate DESC)			
		WHERE (C.ClaimStatusId = 6 OR C.ClaimStatusId = 7) OR (PE.PersonEventStatusId = 2 OR PE.PersonEventStatusId = 4)
		AND PE.DateCaptured BETWEEN ''' + @DateFrom   + ''' AND ''' +  @DateTo +''''
	
   IF @Product <>'All'
		BEGIN		   
			SET  @SQLQUERY =Replace(@SQLQUERY,'''''','')
			SET  @SQLQUERY += ' AND brg.Name IN (select value from string_split('''+ @Brokerage +''','',''))'
		END

      IF @Brokerage <>'All'
		BEGIN
			SET  @SQLQUERY =Replace(@SQLQUERY,'''''','')
			SET  @SQLQUERY += ' AND brg.Name IN (select value from string_split('''+ @Brokerage +''','',''))'
		END


	IF @Scheme <>'All'
		BEGIN
		    SET  @SQLQUERY =Replace(@SQLQUERY,'''''','')
		    SET  @SQLQUERY += ' AND parp.DisplayName IN (select value from string_split('''+ @Scheme +''','',''))'
		END	
		
	DECLARE @Claim AS TABLE(
			[RegistrationDate]  DATETIME,
			[DateCaptured] DATETIME,
			[ClaimNumber]  VARCHAR(20),
			[Channel] VARCHAR(50),
			[Assessor] VARCHAR(100),
			[DeceasedName] VARCHAR(255),
			[DeceasedSurname] VARCHAR(255),
			[ProductType]  VARCHAR(100),
			[PolicyNumber]	VARCHAR(20),
			[TypeOfDeath] VARCHAR(50),
			[DateOfDeath]	 DATE,
			[BenefitAmount] INT,
			[Brokerage] VARCHAR(100),
			[Broker]  VARCHAR(100),
			[Scheme] VARCHAR(100),
			[CompanyName]  VARCHAR(100),
			[Reason] VARCHAR(100),
			[ClosedDate]  DATETIME,
			[Ageing] VARCHAR(100));

	INSERT INTO @Claim  EXECUTE SP_EXECUTESQL @SQLQUERY

	SELECT  * FROM @Claim	ORDER BY [ClosedDate] desc
END