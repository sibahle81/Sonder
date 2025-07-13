
CREATE   PROCEDURE [claim].[MemberInsuredLives]   
	@Filter INT,
	@ShowActive bit,
	@PageIndex	INT ,
    @PageSize	INT = 5,
	@SortColumn	VARCHAR(Max)= 'PolicyNumber',
	@SortOrder	CHAR(4) = 'asc',
	@RecordCount	INT = 0 OUTPUT
AS


BEGIN
	--Stores entire result set
	DECLARE @SearchTable TABLE (
		PolicyOwnerId INT,
		RolePlayerId INT,
	    FirstName VARCHAR(250),
		Surname VARCHAR(250),
		DateOfBirth Date,
		IdNumber VARCHAR(250),
		IsAlive BIT,
		DateOfDeath Date,
		DeathCertificateNumber VARCHAR(250),
		IsVopdVerified BIT,
		IsStudying BIT,
		IsDisabled BIT,
		CellNumber VARCHAR(250),
		EmailAddress VARCHAR(250),
		PreferredCommunicationType VARCHAR(250),
		Relation VARCHAR(250),
		PolicyId INT,
		RolePlayerTypeId INT,
		CommunicationTypeId INT,
		PolicyNumber VARCHAR(50),
		IndustryNumber VARCHAR(50),
		EmployeeNumber VARCHAR(50),
		ClaimReferenceNumber VARCHAR(20),
		PolicyCancelReason VARCHAR(100),
		PolicyStatus VARCHAR(50)
	);

	--Filtered result set
	DECLARE @ResultTable TABLE (
		PolicyOwnerId INT,
		RolePlayerId INT,
	    FirstName VARCHAR(250),
		Surname VARCHAR(250),
		DateOfBirth Date,
		IdNumber VARCHAR(250),
		IsAlive BIT,
		DateOfDeath Date,
		DeathCertificateNumber VARCHAR(250),
		IsVopdVerified BIT,
		IsStudying BIT,
		IsDisabled BIT,
		CellNumber VARCHAR(250),
		EmailAddress VARCHAR(250),
		PreferredCommunicationType VARCHAR(250),
		Relation VARCHAR(250),
		PolicyId INT,
		RolePlayerTypeId INT,
		CommunicationTypeId INT,
		PolicyNumber VARCHAR(50),
		IndustryNumber VARCHAR(50),
		EmployeeNumber VARCHAR(50),
		ClaimReferenceNumber VARCHAR(20),
		PolicyCancelReason VARCHAR(100),
		PolicyStatus VARCHAR(50)
	);

	IF(@ShowActive = 1)
	BEGIN
		INSERT @SearchTable
		SELECT
			Policy.PolicyOwnerId,
			Person.RolePlayerId,
			Person.FirstName,
			Person.Surname,
			Person.DateOfBirth,
			Person.IdNumber,
			Person.IsAlive,
			Person.DateOfDeath,
			Person.DeathCertificateNumber,
			Person.IsVopdVerified,
			Person.IsStudying,
			Person.IsDisabled,
			RolePlayer.CellNumber,
			RolePlayer.EmailAddress,
			CASE WHEN CommunicationType.Name IS NULL
			     THEN 'SMS'
		     End AS Name,
			RolePlayerType.Name,
			Policy.PolicyId,
			RolePlayerType.RolePlayerTypeId,
			CASE WHEN CommunicationType.Id IS NULL
			     THEN 3
			ELSE CommunicationType.Id
			END AS Id,
			Policy.PolicyNumber,
			'' IndustryNumber,
			'' EmployeeNumber,
			isnull (personevent.Personeventreferencenumber,'N/A') AS	ClaimReferenceNumber,
			isnull(pcr.Name,'N/A') as PolicyCancelReason ,
		    ps.Name as PolicyStatus
		FROM policy.Policy Policy WITH (NOLOCK)	
		Left JOIN common.PolicyCancelReason pcr ON pcr.ID=policy.PolicyCancelReasonId
		Left JOIN common.PolicyStatus ps ON ps.ID=policy.PolicyStatusId
		INNER JOIN policy.PolicyInsuredLives PolicyInsuredLives WITH (NOLOCK) ON PolicyInsuredLives.PolicyId = Policy.PolicyId	
		INNER JOIN client.RolePlayer RolePlayer WITH (NOLOCK) ON RolePlayer.RolePlayerId = PolicyInsuredLives.RolePlayerId
		LEFT JOIN common.CommunicationType CommunicationType WITH (NOLOCK) ON RolePlayer.PreferredCommunicationTypeId = CommunicationType.Id
		LEFT JOIN client.Person Person WITH (NOLOCK) ON Person.RolePlayerId = RolePlayer.RolePlayerId
		INNER JOIN [client].[RolePlayerType] RolePlayerType WITH (NOLOCK) ON PolicyInsuredLives.RolePlayerTypeId = RolePlayerType.RolePlayerTypeId
		LEFT JOIN client.Company Company WITH (NOLOCK) ON Company.RolePlayerId = RolePlayer.RolePlayerId
		--LEFT JOIN [client].[RolePlayerRelation] Relation WITH (NOLOCK) ON Relation.FromRolePlayerId = RolePlayer.RolePlayerId
		--LEFT JOIN [client].[RolePlayerType] RolePlayerType WITH (NOLOCK) ON RolePlayerType.RolePlayerTypeId = Relation.RolePlayerTypeId
		LEFT JOIN [Claim].[Personevent] personevent WITH (NOLOCK) ON personevent.insuredLifeId = RolePlayer.RolePlayerId
		WHERE Policy.IsDeleted = 0 AND RolePlayer.IsDeleted = 0  and policy.PolicyStatusId NOT IN(2,7) --AND PolicyInsuredLives.RolePlayerTypeId != 41
	END
	ELSE IF(@ShowActive = 0)
	BEGIN
		INSERT @SearchTable
		SELECT
			Policy.PolicyOwnerId,
			Person.RolePlayerId,
			Person.FirstName,
			Person.Surname,
			Person.DateOfBirth,
			Person.IdNumber,
			Person.IsAlive,
			Person.DateOfDeath,
			Person.DeathCertificateNumber,
			Person.IsVopdVerified,
			Person.IsStudying,
			Person.IsDisabled,
			RolePlayer.CellNumber,
			RolePlayer.EmailAddress,
			CASE WHEN CommunicationType.Name IS NULL
			     THEN 'SMS'
		     End AS Name,
			RolePlayerType.Name,
			Policy.PolicyId,
			RolePlayerType.RolePlayerTypeId,
			CASE WHEN CommunicationType.Id IS NULL
			     THEN 3
			ELSE CommunicationType.Id
			END AS Id,
			Policy.PolicyNumber,
			'' IndustryNumber,
			'' EmployeeNumber,
			isnull (personevent.Personeventreferencenumber,'N/A') AS	ClaimReferenceNumber,
			isnull(pcr.Name,'N/A') as PolicyCancelReason ,
		    ps.Name as PolicyStatus
		FROM policy.Policy Policy WITH (NOLOCK)	
		Left JOIN common.PolicyCancelReason pcr ON pcr.ID=policy.PolicyCancelReasonId
		Left JOIN common.PolicyStatus ps ON ps.ID=policy.PolicyStatusId
		INNER JOIN policy.PolicyInsuredLives PolicyInsuredLives WITH (NOLOCK) ON PolicyInsuredLives.PolicyId = Policy.PolicyId	
		INNER JOIN client.RolePlayer RolePlayer WITH (NOLOCK) ON RolePlayer.RolePlayerId = PolicyInsuredLives.RolePlayerId
		LEFT JOIN common.CommunicationType CommunicationType WITH (NOLOCK) ON RolePlayer.PreferredCommunicationTypeId = CommunicationType.Id
		LEFT JOIN client.Person Person WITH (NOLOCK) ON Person.RolePlayerId = RolePlayer.RolePlayerId
		INNER JOIN [client].[RolePlayerType] RolePlayerType WITH (NOLOCK) ON PolicyInsuredLives.RolePlayerTypeId = RolePlayerType.RolePlayerTypeId
		LEFT JOIN client.Company Company WITH (NOLOCK) ON Company.RolePlayerId = RolePlayer.RolePlayerId
		--LEFT JOIN [client].[RolePlayerRelation] Relation WITH (NOLOCK) ON Relation.FromRolePlayerId = RolePlayer.RolePlayerId
		--LEFT JOIN [client].[RolePlayerType] RolePlayerType WITH (NOLOCK) ON RolePlayerType.RolePlayerTypeId = Relation.RolePlayerTypeId
		LEFT JOIN [Claim].[Personevent] personevent WITH (NOLOCK) ON personevent.insuredLifeId = RolePlayer.RolePlayerId
		WHERE Policy.IsDeleted = 0 AND RolePlayer.IsDeleted = 0 
	END
	ELSE 
	BEGIN
	--------------------------------------------------------------------------- Inactive Policies + Claims --------------------------------------------------
		INSERT @SearchTable
		SELECT
			Policy.PolicyOwnerId,
			Person.RolePlayerId,
			Person.FirstName,
			Person.Surname,
			Person.DateOfBirth,
			Person.IdNumber,
			Person.IsAlive,
			Person.DateOfDeath,
			Person.DeathCertificateNumber,
			Person.IsVopdVerified,
			Person.IsStudying,
			Person.IsDisabled,
			RolePlayer.CellNumber,
			RolePlayer.EmailAddress,
			CommunicationType.Name,
			RolePlayerType.Name,
			Policy.PolicyId,
			RolePlayerType.RolePlayerTypeId,
			CommunicationType.Id,
			Policy.PolicyNumber,
			'' IndustryNumber,
			'' EmployeeNumber,
			isnull (personevent.Personeventreferencenumber,'N/A') AS	ClaimReferenceNumber,
			isnull(pcr.Name,'N/A') as PolicyCancelReason ,
		    ps.Name as PolicyStatus
		FROM policy.Policy Policy WITH (NOLOCK)
		Left JOIN common.PolicyCancelReason pcr ON pcr.ID=policy.PolicyCancelReasonId
		Left JOIN common.PolicyStatus ps ON ps.ID=policy.PolicyStatusId	
		INNER JOIN policy.PolicyInsuredLives PolicyInsuredLives WITH (NOLOCK) ON PolicyInsuredLives.PolicyId = Policy.PolicyId	
		INNER JOIN client.RolePlayer RolePlayer WITH (NOLOCK) ON RolePlayer.RolePlayerId = PolicyInsuredLives.RolePlayerId
		INNER JOIN common.CommunicationType CommunicationType WITH (NOLOCK) ON RolePlayer.PreferredCommunicationTypeId = CommunicationType.Id
		INNER JOIN [client].[RolePlayerType] RolePlayerType WITH (NOLOCK) ON PolicyInsuredLives.RolePlayerTypeId = RolePlayerType.RolePlayerTypeId
		LEFT JOIN client.Person Person WITH (NOLOCK) ON Person.RolePlayerId = RolePlayer.RolePlayerId
		LEFT JOIN client.Company Company WITH (NOLOCK) ON Company.RolePlayerId = RolePlayer.RolePlayerId
		--LEFT JOIN [client].[RolePlayerRelation] Relation WITH (NOLOCK) ON Relation.FromRolePlayerId = RolePlayer.RolePlayerId
		--LEFT JOIN [client].[RolePlayerType] RolePlayerType WITH (NOLOCK) ON RolePlayerType.RolePlayerTypeId = Relation.RolePlayerTypeId
		LEFT JOIN [Claim].[Personevent] personevent WITH (NOLOCK) ON personevent.insuredLifeId = RolePlayer.RolePlayerId
		WHERE Policy.IsDeleted = 1 AND RolePlayer.IsDeleted = 1 --and PolicyInsuredLives.RolePlayerTypeId != 41
	END

	--IF (@FilterType = 1) --Policy Number
	BEGIN
		INSERT @ResultTable
		SELECT
			PolicyOwnerId,
			RolePlayerId,
			FirstName,
			Surname,
			DateOfBirth,
			IdNumber,
			IsAlive,
			DateOfDeath,
			DeathCertificateNumber,
			IsVopdVerified,
			IsStudying,
			IsDisabled,
			CellNumber,
			EmailAddress,
			PreferredCommunicationType,
			Relation,
			PolicyId,
			RolePlayerTypeId,
			CommunicationTypeId,
			PolicyNumber,
			IndustryNumber,
			EmployeeNumber,
			ClaimReferenceNumber,
			PolicyCancelReason,
		    PolicyStatus
		FROM @SearchTable
		WHERE (PolicyOwnerId = @Filter )
			  AND RolePlayerId is not null
	END

	SELECT @RecordCount = COUNT(*) FROM @ResultTable

	SELECT * FROM (
		SELECT
		    ROW_NUMBER() OVER (ORDER BY  + @SortColumn + ' ' + @SortOrder)AS ROW,
			RolePlayerId,
			FirstName,
			Surname,
			DateOfBirth,
			IdNumber,
			IsAlive,
			DateOfDeath,
			DeathCertificateNumber,
			IsVopdVerified,
			IsStudying,
			IsDisabled,
			CellNumber,
			EmailAddress,
			PreferredCommunicationType,
			Relation,
			PolicyId,
			RolePlayerTypeId,
			CommunicationTypeId,
			PolicyNumber,
			IndustryNumber,
			EmployeeNumber,
			ClaimReferenceNumber,
			PolicyCancelReason,
			PolicyStatus
		FROM @ResultTable) ResTable
		WHERE ROW BETWEEN (@PageIndex - 1) * @PageSize + 1 AND @PageIndex * @PageSize

		--SELECT @RecordCount     
END