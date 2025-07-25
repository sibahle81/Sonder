
-- =============================================
-- Author:		Gram Letoaba
-- Create date: 03/03/2020
-- =============================================
CREATE PROCEDURE [billing].[SearchPoliciesForInvoices]
	@FilterType INT = NULL,
	@Filter VARCHAR(50),
	@ShowActive bit = 1
AS
BEGIN
	--Stores entire result set
	DECLARE @SearchTable TABLE (
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
		EmployeeNumber VARCHAR(50)
	);

	--Filtered result set
	DECLARE @ResultTable TABLE (
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
		EmployeeNumber VARCHAR(50)
	);
	--Remove the spaces
	SET @Filter = RTRIM(LTRIM(@Filter))

	IF(@ShowActive = 1)
	BEGIN
		INSERT @SearchTable
		SELECT
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
			'' EmployeeNumber
		FROM policy.Policy Policy WITH (NOLOCK)	
		INNER JOIN policy.PolicyInsuredLives PolicyInsuredLives WITH (NOLOCK) ON PolicyInsuredLives.PolicyId = Policy.PolicyId	
		INNER JOIN client.RolePlayer RolePlayer WITH (NOLOCK) ON RolePlayer.RolePlayerId = PolicyInsuredLives.RolePlayerId
		INNER JOIN common.CommunicationType CommunicationType WITH (NOLOCK) ON RolePlayer.PreferredCommunicationTypeId = CommunicationType.Id
		LEFT JOIN client.Person Person WITH (NOLOCK) ON Person.RolePlayerId = RolePlayer.RolePlayerId
		LEFT JOIN client.Company Company WITH (NOLOCK) ON Company.RolePlayerId = RolePlayer.RolePlayerId
		LEFT JOIN [client].[RolePlayerRelation] Relation WITH (NOLOCK) ON Relation.FromRolePlayerId = RolePlayer.RolePlayerId
		LEFT JOIN [client].[RolePlayerType] RolePlayerType WITH (NOLOCK) ON RolePlayerType.RolePlayerTypeId = Relation.RolePlayerTypeId
		WHERE Policy.IsDeleted = 0 AND RolePlayer.IsDeleted = 0
	END
	ELSE
	BEGIN
	--------------------------------------------------------------------------- Inactive Policies + Claims --------------------------------------------------
		INSERT @SearchTable
		SELECT
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
			'' EmployeeNumber
		FROM policy.Policy Policy WITH (NOLOCK)	
		INNER JOIN policy.PolicyInsuredLives PolicyInsuredLives WITH (NOLOCK) ON PolicyInsuredLives.PolicyId = Policy.PolicyId	
		INNER JOIN client.RolePlayer RolePlayer WITH (NOLOCK) ON RolePlayer.RolePlayerId = PolicyInsuredLives.RolePlayerId
		INNER JOIN common.CommunicationType CommunicationType WITH (NOLOCK) ON RolePlayer.PreferredCommunicationTypeId = CommunicationType.Id
		LEFT JOIN client.Person Person WITH (NOLOCK) ON Person.RolePlayerId = RolePlayer.RolePlayerId
		LEFT JOIN client.Company Company WITH (NOLOCK) ON Company.RolePlayerId = RolePlayer.RolePlayerId
		LEFT JOIN [client].[RolePlayerRelation] Relation WITH (NOLOCK) ON Relation.FromRolePlayerId = RolePlayer.RolePlayerId
		LEFT JOIN [client].[RolePlayerType] RolePlayerType WITH (NOLOCK) ON RolePlayerType.RolePlayerTypeId = Relation.RolePlayerTypeId
		WHERE Policy.IsDeleted = 1 AND RolePlayer.IsDeleted = 1 
	END

	--IF (@FilterType = 1) --Policy Number
	BEGIN
		INSERT @ResultTable
		SELECT
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
			EmployeeNumber
		FROM @SearchTable
		WHERE (@Filter IS NULL OR 
			  PolicyNumber like '%' +@Filter + '%' OR
			  IdNumber like '%' +@Filter + '%' OR
			  EmployeeNumber like '%' +@Filter + '%' OR
			  FirstName like '%' +@Filter + '%' OR 
			  Surname like '%' + @Filter + '%' OR 
			  FirstName + ' ' + Surname like '%' + @Filter + '%')
	END

	SELECT
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
		EmployeeNumber
	FROM @ResultTable	
	ORDER BY PolicyNumber, FirstName, Surname
END
