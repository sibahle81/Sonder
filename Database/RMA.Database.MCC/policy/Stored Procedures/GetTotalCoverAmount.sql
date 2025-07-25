CREATE PROCEDURE [policy].[GetTotalCoverAmount] (@idTypeId int, @idNumber varchar(64), @policyId int = null) 
AS
BEGIN
	-- Converted to function so that update statements can also call it,
	-- Leave as stored procedure so that it can also be called from the services.
	select dbo.GetTotalCoverAmount(@idTypeId, @idNumber, @policyId) [Amount]
END
