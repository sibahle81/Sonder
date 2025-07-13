
CREATE PROCEDURE [client].[RenewalMarkNonCompliant] 
(
	@IndustryClassId INT,
	@DeclarationType INT,
	@PenaltyPercentage Float,
	@InflationPercentage Float,
	@DeclarationYear INT,
	@DeclarationConfigurationDetailId INT
)
AS 
BEGIN 
	-- Get all the declaration data based on industry classId and renewalStatus
	Select D.*	
	into #Declaration
	from client.Declaration D 
	inner join client.Company C on D.RolePlayerId = C.RolePlayerId
	where C.IndustryClassId = @IndustryClassId AND D.DeclarationRenewalStatusId = 1
	select * from #Declaration

	--Insert into Billing Integration from #Table
	insert into client.DeclarationBillingIntegration
	select DeclarationId, PenaltyPremium, 1, 1, null, null from #Declaration
		
	--Update declaration table fields to non compliant
	UPDATE client.Declaration
	SET DeclarationRenewalStatusId = 3
	from client.Declaration D 
	inner join client.Company C on D.RolePlayerId = C.RolePlayerId
	where C.IndustryClassId = @IndustryClassId AND D.DeclarationRenewalStatusId = 1	     
END