-- =============================================

-- Author:           Cameron

-- Create date: 03/20/2020

-- Description:      Claims Actuarial

-- =============================================

CREATE PROCEDURE [claim].[GetClaimsActuarialReport]

       -- Add the parameters for the stored procedure here

       @DateFrom AS DATE,

       @DateTo AS DATE

AS

BEGIN

       -- SET NOCOUNT ON added to prevent extra result sets from

       -- interfering with SELECT statements.

       SET NOCOUNT ON;

 

              SELECT p.PolicyNumber AS 'Policy No'

              , p.PolicyInceptionDate AS 'Inception Date'

              , 'Employer' AS 'Employer'

              , rpt.[Name] AS 'Member Type'

              , rp.FirstName + ' ' + rp.Surname AS 'Employee'

              , pe.InsuredLifeId AS 'Life Assured'

              , rp.DateOfBirth AS 'DOB'

              , br.BenefitAmount AS 'Sum Assured'

              , dt.DeathDate AS 'Date of Loss'

              , pe.DateReceived AS 'Date Of Notification'

              , pay.PaymentConfirmationDate AS 'Payment Date'

              , pay.amount AS 'Gross Amount'

              , 'Reinsured REcoveries' AS 'Reinsured REcoveries'

              , pay.amount AS 'Net Amount Paid'

              , cs.[Name]

 

              FROM claim.claim c

                     JOIN [claim].[PersonEvent] (NOLOCK) pe ON pe.PersonEventId = c.PersonEventId

                     JOIN [claim].[PersonEventDeathDetail] (NOLOCK) dt ON dt.PersonEventId = pe.PersonEventId

                     JOIN [policy].[Policy] (NOLOCK) p ON p.PolicyId = c.PolicyId

                     JOIN [Payment].[Payment] (NOLOCK) pay ON pay.policyid = p.policyid

                     JOIN [client].[Person] (NOLOCK) rp on rp.RolePlayerId = pe.InsuredLifeId

                     JOIN [policy].policyInsuredLives pil ON pil.RolePlayerId = pe.InsuredLifeId

                     --JOIN [client].[Company] (NOLOCK) com ON  com.roleplayerid =  pe.InsuredLifeId

                     JOIN [Claim].[ClaimStatus] (NOLOCK) cs ON cs.ClaimStatusId = c.ClaimStatusId

                     JOIN client.RolePlayerType rpt ON rpt.RolePlayerTypeId = pil.RolePlayerTypeId

                     JOIN [product].[ProductOptionBenefit] pob ON pob.ProductOptionId = p.ProductOptionId

                     JOIN [product].BenefitRate br ON br.BenefitId = pob.BenefitId

                    

                     WHERE pay.CreatedDate BETWEEN @datefrom AND @dateto

END
