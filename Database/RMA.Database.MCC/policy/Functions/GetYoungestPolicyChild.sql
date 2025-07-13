-- =============================================
-- Author:           <Author,,Name>
-- Create date: <Create Date, ,>
-- Description:      <Description, ,>
-- =============================================
CREATE FUNCTION  [policy].[GetYoungestPolicyChild] 
(
       @policyId int, 
       @age int
)
RETURNS int
AS
BEGIN
       
       RETURN @age;

END