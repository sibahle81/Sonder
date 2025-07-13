  
-- =============================================
-- JP Kruger
-- Group policy - Child cancel request
-- =============================================
CREATE PROCEDURE  [policy].[CancelRequestGroupPolicyChild]
 
 @policyId int,
 @status int

AS
BEGIN
	 
 UPDATE [policy].Policy
 SET PolicyStatusId = @status
 WHERE PolicyId = @policyId

END