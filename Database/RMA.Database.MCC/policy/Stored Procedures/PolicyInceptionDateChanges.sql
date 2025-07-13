
CREATE PROC [policy].[PolicyInceptionDateChanges]
(@month INT = 0,
@year INT = 0
)
as
/*

exec [policy].[PolicyInceptionDateChanges] @month = 11, @year = 2020

*/
begin
WITH PolicyInceptionDates AS 
(SELECT        
[ItemId] [PolicyId], [Date] ChangeDate, json_value([OldItem], '$.PolicyInceptionDate') [OldDate], 
json_value([NewItem], '$.PolicyInceptionDate') 
[NewDate]
FROM    [audit].[AuditLog]
WHERE        [ItemType] = 'policy_Policy' AND [Action] = 'Modified' AND (@month = 0 OR
MONTH([Date]) = @month) AND (@year = 0 OR
YEAR([Date]) = @year) AND json_value([OldItem], '$.PolicyInceptionDate') != json_value([NewItem], '$.PolicyInceptionDate'))
SELECT        PP.PolicyNumber, PP.InstallmentPremium, PID.OldDate, PID.NewDate, 
R.DisplayName, PO.Name ProductOption, PY.CreatedDate RefundPaymentDate, PID.ChangeDate, 
CASE WHEN PY.CreatedDate IS NOT NULL 
THEN 'Yes' WHEN PY.CreatedDate IS NULL THEN 'No' END AS 'RefundPaid',
CASE WHEN R.RolePlayerIdentificationTypeId = 2 THEN CMP.IdNumber WHEN R.RolePlayerIdentificationTypeId = 1 THEN CP.IdNumber END AS 'IdNumber', 
CASE WHEN R.RolePlayerIdentificationTypeId = 2 THEN '' WHEN R.RolePlayerIdentificationTypeId = 1 THEN CP.DateOfBirth END AS 'DOB'
FROM            PolicyInceptionDates PID JOIN
[policy].[Policy] PP ON PID.PolicyId = PP.PolicyId JOIN
client.RolePlayer R ON R.RolePlayerId = PP.PolicyOwnerId JOIN
[product].[ProductOption] PO ON PP.ProductOptionId = PO.Id LEFT JOIN
client.Person CP ON CP.RolePlayerId = R.RolePlayerId LEFT JOIN
client.Company CMP ON CMP.RolePlayerId = R.RolePlayerId LEFT JOIN
payment.Payment PY ON PY.PolicyId = PP.PolicyId AND PY.PaymentTypeId = 3
end