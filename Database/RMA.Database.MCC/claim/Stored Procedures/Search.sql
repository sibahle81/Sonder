-- =============================================
-- Author:		Jarrod Ramsaroop
-- Create date: 06/05/2019
-- Change 
-- Description:	The claim landing search screen
-- [claim].[Search] 4, '20000371', 1
-- 1 => Policy, 2 => Id Number, 3 => Passport, 4 => Claim Ref, 5 => Industry Number, 6 => Employee Number, 7 => Name
-- =============================================
CREATE PROCEDURE [claim].[Search]
	@FilterType INT = 7,
	@Filter VARCHAR(50) = '19000014',
	@ShowActive bit = 1
AS
BEGIN 
	--Stores entire result set
	DECLARE @SearchTable TABLE (
		PolicyId INT,
		PolicyNumber VARCHAR(50),
		ProductId INT,
		ProductName VARCHAR(250),
		ClaimId INT,
		ClaimReferenceNumber VARCHAR(50),
		Status VARCHAR(250),
		StatusReason VARCHAR(250),
		InsuredLifeId INT,
		PersonEventId INT,
		IdNumber VARCHAR(250),
		MemberFirstName VARCHAR(250),
		MemberLastName VARCHAR(250),
		MemberRole VARCHAR(50),
		IndustryNumber VARCHAR(50),
		EmployeeNumber VARCHAR(50),		
		WizardId INT,		
		IsRuleOverridden bit,
		AuthorisedAmount decimal,
		InvoiceDate Date,
		InvoiceAmount decimal,		
		RepudiatedAmount decimal,
		ClaimRepudiationReason VARCHAR(50),
		ClaimRepudiationDate DateTime,
		ClaimChangeDate DateTime

	);

	--Stores entire result set
	DECLARE @ClaimTable TABLE (
		PolicyId INT,
		PolicyNumber VARCHAR(50),
		ProductId INT,
		ProductName VARCHAR(250),
		ClaimId INT,
		ClaimReferenceNumber VARCHAR(50),
		Status VARCHAR(250),
		StatusReason VARCHAR(250),
		InsuredLifeId INT,
		PersonEventId INT,
		IdNumber VARCHAR(250),
		MemberFirstName VARCHAR(250),
		MemberLastName VARCHAR(250),
		MemberRole VARCHAR(50),
		IndustryNumber VARCHAR(50),
		EmployeeNumber VARCHAR(50),		
		WizardId VARCHAR(250),		
		IsRuleOverridden bit,
		AuthorisedAmount decimal,
		InvoiceDate Date,
		InvoiceAmount decimal,		
		RepudiatedAmount decimal,
		ClaimRepudiationReason VARCHAR(50),
		ClaimRepudiationDate DateTime,
		ClaimChangeDate DateTime
	);


	--Filtered result set
	DECLARE @ResultTable TABLE (
		PolicyId INT,
		PolicyNumber VARCHAR(50),
		ProductId INT,
		ProductName VARCHAR(250),
		ClaimId INT,
		ClaimReferenceNumber VARCHAR(50),
		Status VARCHAR(250),
		StatusReason VARCHAR(250),
		InsuredLifeId INT,
		PersonEventId INT,
		IdNumber VARCHAR(250),
		MemberFirstName VARCHAR(250),
		MemberLastName VARCHAR(250),
		MemberRole VARCHAR(50),
		IndustryNumber VARCHAR(50),
		EmployeeNumber VARCHAR(50),		
		WizardId VARCHAR(250),		
		IsRuleOverridden bit,
		AuthorisedAmount decimal,
		InvoiceDate Date,
		InvoiceAmount decimal,
		
		RepudiatedAmount decimal,
		ClaimRepudiationReason VARCHAR(50),
		ClaimRepudiationDate DateTime,
		ClaimChangeDate DateTime
	);
	--Remove the spaces
	SET @Filter = RTRIM(LTRIM(@Filter))

	IF(@ShowActive = 1)
	BEGIN
--------------------------------------------------------------------------- Active Policies + Claims --------------------------------------------------
		INSERT @ClaimTable
		-- Claim		
			SELECT
			policy.PolicyId,
			policy.PolicyNumber,
			0 ProductId,
			'Funeral' ProductName,
			claim.ClaimId,
			--claim.ClaimReferenceNumber,
			personevent.PersonEventId As ClaimReferenceNumber,
				CASE	
				WHEN status.Status  IS NULL
					THEN 'New'
				ELSE
					status.Status 
			END AS Status,
			CASE 
				WHEN status.Name IS NULL 
					THEN 'New'
				ELSE 
					status.Name
			END As StatusReason,--,
			0,
			--RolePlayerId,
			personevent.PersonEventId,
			person.IdNumber,
			person.FirstName,
			person.Surname LastName,
			roleplayertype.Name [Role],
			'' IndustryNumber,
			'' EmployeeNumber,
			wizard.Id wizardId,
			0 IsRuleOverridden,
			COALESCE(invoice.AuthorisedAmount,0),
		    invoice.InvoiceDate ,
		    invoice.InvoiceAmount ,		    
		 CASE	
				WHEN status.Status  = 'Declined'
					THEN invoice.InvoiceAmount 
				ELSE
					0
			END as RepudiatedAmount,
		  CASE	
				status.Status WHEN  'Declined' THEN
			CASE
                WHEN cancel.Name IS NOT NULL THEN cancel.Name
                ELSE 
				status.Reason
				End
			END  As   ClaimRepudiationReason,
		    CASE	
				WHEN status.Status  = 'Declined'
					THEN   claim.ClaimStatusChangeDate 
				ELSE
					Null
			END  as    ClaimRepudiationDate ,
			 claim.ClaimStatusChangeDate 
		FROM claim.PersonEvent personevent -- get case/ person
			/*LEFT JOIN claim.Claim claim ON claim.PersonEventId = personevent.PersonEventId -- get claim
			INNER JOIN claim.ClaimStatus [status] on status.ClaimStatusId = claim.ClaimStatusId
			INNER JOIN policy.Policy [policy] ON policy.PolicyId = claim.policyId -- get policy number
			INNER JOIN client.Person person ON person.RolePlayerId = personevent.InsuredLifeId -- get person information
			LEFT JOIN policy.PolicyInsuredLives insuredlife ON insuredlife.PolicyId = policy.policyId AND personevent.InsuredLifeId = insuredlife.RolePlayerId
			INNER JOIN client.RolePlayerType roleplayertype ON roleplayertype.RolePlayerTypeId = insuredlife.RolePlayerTypeId
			INNER JOIN bpm.wizard wizard ON wizard.linkeditemid = personevent.EventId*/
			INNER JOIN claim.Event event WITH (NOLOCK) ON event.EventId=personevent.EventID
			INNER JOIN bpm.Wizard wizard WITH (NOLOCK) ON personevent.EventId = wizard.LinkedItemId
			INNER JOIN bpm.WizardConfiguration WConfig WITH (NOLOCK) ON WConfig.Id = wizard.WizardConfigurationId
			INNER JOIN client.RolePlayer roleplayer WITH (NOLOCK) ON roleplayer.RolePlayerId = PersonEvent.InsuredLifeId

			
			LEFT JOIN claim.Claim claim WITH (NOLOCK) ON claim.PersonEventId = personevent.PersonEventId
			LEFT JOIN claim.ClaimStatus status WITH (NOLOCK) ON status.claimstatusid =claim.claimstatusid
			LEFT JOIN claim.ClaimInvoice invoice WITH (NOLOCK) ON invoice.ClaimId=claim.ClaimId
			LEFT JOIN common.ClaimCancellationReason cancel WITH (NOLOCK) on cancel.Id= claim.ClaimCancellationReasonId
			LEFT JOIN policy.PolicyInsuredLives insuredlife WITH (NOLOCK) ON insuredlife.RolePlayerId = personevent.InsuredLifeId	
			INNER JOIN client.roleplayertype roleplayertype WITH (NOLOCK) ON roleplayertype.RolePlayerTypeId = insuredlife.RolePlayerTypeId
			--INNER JOIN  Client.RolePlayerRelation insuredlife WITH(NOLOCK) ON insuredlife.FromRolePlayerId = RolePlayer.RolePlayerId
			LEFT JOIN policy.Policy policy WITH (NOLOCK) ON policy.policyId = insuredlife.PolicyId
			INNER JOIN client.Person person WITH (NOLOCK) ON person.RolePlayerId = personevent.InsuredLifeId -- get person information
		WHERE 
			 -- Commented out due to stillborn events not returning
			policy.IsDeleted = 0 AND 
			person.IsDeleted = 0 AND
			wizard.WizardConfigurationId IN(14,29) AND  (wizard.WizardStatusId<>4)
			AND personevent.IsDeleted = 0 --AND claim.IsDeleted = 0 
			--AND roleplayertype.RolePlayerTypeId != 41
		
		INSERT @SearchTable

		SELECT * FROM @ClaimTable
		UNION
		(SELECT
			policy.PolicyId ,
			policy.PolicyNumber,
			0 ProductId,
			'Funeral' ProductName,
			0 ClaimId,
			'' ClaimReferenceNumber,
			'' StatusName,
			'' StatusReason,
			insuredlife.RolePlayerId,
			pe.PersonEventId,
			person.IdNumber,
			person.FirstName,
			person.Surname LastName,
			roleplayertype.Name [Role],
			'' IndustryNumber,
			'' EmployeeNumber,
			0 wizardId,
			0 IsRuleOverridden,
			COALESCE(AuthorisedAmount,0) AuthorisedAmount,
		InvoiceDate,
		COALESCE(InvoiceAmount,0) InvoiceAmount,		
		RepudiatedAmount ,
		ClaimRepudiationReason,
		ClaimRepudiationDate,
		ClaimChangeDate
		FROM policy.Policy [policy] WITH (NOLOCK)
			LEFT JOIN policy.PolicyInsuredLives insuredlife WITH (NOLOCK) ON insuredlife.PolicyId = policy.policyId
			INNER JOIN client.Person person WITH (NOLOCK) ON person.RolePlayerId = insuredlife.RolePlayerId
			LEFT JOIN client.RolePlayerType roleplayertype WITH (NOLOCK) ON roleplayertype.RolePlayerTypeId = insuredlife.RolePlayerTypeId
			LEFT JOIN @ClaimTable ct ON ct.PolicyId = policy.PolicyId AND ct.InsuredLifeId = insuredlife.RolePlayerId
			INNER JOIN PersonEvent pe ON pe.PersonEventId=ct.PersonEventId
		WHERE 
			policy.IsDeleted = 0 AND person.IsDeleted = 0 AND ct.ClaimId IS NULL)
	END	

		SELECT
			PolicyId,
			PolicyNumber,
			ProductId,
			ProductName,
			ClaimId,
			ClaimReferenceNumber,
			Status,
			StatusReason,
			InsuredLifeId,
			PersonEventId,
			IdNumber,
			MemberFirstName,
			MemberLastName,			
			MemberRole,			
			IndustryNumber,
			EmployeeNumber,
			wizardId,
			CAST(0 AS BIT) IsRuleOverridden,
			COALESCE(AuthorisedAmount,0) AuthorisedAmount ,
			InvoiceDate,
			COALESCE(InvoiceAmount,0) InvoiceAmount,		
			RepudiatedAmount ,
			ClaimRepudiationReason,
			ClaimRepudiationDate,
			ClaimChangeDate
		FROM @SearchTable
		WHERE
			  (@Filter IS NULL OR 
			  PolicyNumber like '%' +@Filter + '%' OR
			  IdNumber like '%' +@Filter + '%' OR
			  EmployeeNumber like '%' +@Filter + '%' OR
			  ClaimReferenceNumber like '%' +@Filter + '%' OR
			  MemberFirstName like '%' +@Filter + '%' OR 
			  MemberLastName like '%' + @Filter + '%' OR 
			  MemberFirstName + ' ' + MemberLastName like '%' + @Filter + '%' OR  
			  PersonEventId like '%' +@Filter + '%') AND wizardId<>0
END