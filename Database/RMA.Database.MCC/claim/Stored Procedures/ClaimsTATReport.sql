

CREATE PROCEDURE [claim].[ClaimsTATReport] --'2020-12-01', '2021-04-30','5'
                @DateFrom As Date,
                @DateTo AS Date,
                @CoverType int
AS

BEGIN

DECLARE @Products TABLE ([Id] INT,[Description]  VARCHAR(30));

 INSERT INTO @Products(Id,[Description])
  VALUES(0,'All'),
		(1,'Corporate'),
		(2,'Goldwage'),
		(3,'Group'),
		(4,'Individual')

DECLARE @SelectedProduct VARCHAR(30) 
SELECT TOP 1 @SelectedProduct = [Description] from @Products WHERE ID = @CoverType

        SELECT DISTINCT
        CASE WHEN ICD.Id = 4 THEN
        (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'INDF')
        WHEN ICD.Id = 1  THEN 
        (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Mining')
                                WHEN ICD.Id = 2  THEN 
        (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Metals')
                                WHEN ICD.Id = 3  THEN 
        (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Class Other')
        END AS ControlNumber,               
                CASE WHEN ICD.Id = 4 THEN
        (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'INDF')
        WHEN ICD.Id = 1  THEN 
        (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Mining')
                                WHEN ICD.Id = 2  THEN 
        (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Metals')
                                WHEN ICD.Id = 3  THEN 
        (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Class Other')
                                END AS [ControlName], 
                                CT.[Description] [Product Type],
                                prod.Name AS [ProdOption],
                                CASE WHEN (personeventdeath.DeathTypeId = 3) THEN ISNULL(Policy.PolicyNumber,NULL)
                                ELSE ISNULL(Policy.PolicyNumber,NULL)
                                END PolicyNumber,
                    PersonEvent.PersonEventId As ClaimNumber,     
                                BR.Name As BrokerName,
                                [parp].DisplayName AS                                 [Scheme Name],
                                bpre.SurnameOrCompanyName                [Employer Name], 
                                roleplayer.DisplayName                                [DeceasedName and Surname],
        claimstatus.Status                                                  [ClaimStatus],
        PersonEvent.CreatedBy,
                                StartDateAndTime,
                                claim.claimid,
                                ISNULL(EndDateAndTime, GETDATE()) EndDateAndTime,
                                personevent.CreatedDate as DateCreated,

                                bpm.CalculateOverAllTAT(wizard.StartDateAndTime,
                                                                                                                CASE WHEN claim.ClaimId IS NULL 
                                                                                                                                THEN wizard.EndDateAndTime 
                                                                                                                                ELSE (select top 1 CW.EndDateTime 
                                                                                                                                                from [claim].[claim] CL INNER JOIN [claim].[claimWorkflow] CW 
                                                                                                                                                                ON CL.ClaimId = CW.ClaimId 
                                                                                                                                                                where CL.ClaimId = claim.ClaimId 
                                                                                                                                                order by CW.ClaimWorkflowId desc) 
                                                                                                                                END) As OverAllTAT,

                                roleplayer.RolePlayerId As InsuredLifeId,

                                wizard.id As WizardId,

                                CIA.BeneificaryRolePlayerId As BeneficiaryID1,

                                (Select DisplayName from client.roleplayer where RolePlayerId = CIA.BeneificaryRolePlayerId) As BeneficiaryName,

                                (Select Surname from client.Person where RolePlayerId = CIA.BeneificaryRolePlayerId) As BeneficiarySurname,

                                (Select IdNumber from client.Person where RolePlayerId = CIA.BeneificaryRolePlayerId) As BeneficiaryID,

                                personeventdeath.DeathtypeId,

                                CDT.Description as TypeOfDeath,

                                personeventdeath.DeathDate,

                                personevent.DateReceived As DateReceived,

                                CAST(personevent.DateReceived As DATE) As DateClaimReceived,

                                CONVERT(VARCHAR(8),personevent.DateReceived,108) as TimeClaimReceived,

                                personevent.DateCaptured As DateRegistered,

                                CAST(personevent.DateCaptured As DATE) As DateClaimRegistered,

                                CONVERT(VARCHAR(8),personevent.DateCaptured,108) as TimeClaimRegistered,

                                bpm.CalculateOverAllSLATime((Select Top 1 StartDateTime 
                                from Claim.ClaimWorkflow where claimStatusId in (1) And ClaimId = claim.ClaimId 
                                order by ClaimWorkflowId) ,personevent.DateCaptured) As AVETimeFromClaimRegisteredToCaptured,

                                (Select Top 1 StartDateTime  
                                from Claim.ClaimWorkflow 
                                where claimStatusId in (4) And ClaimId = claim.ClaimId 
                                order by ClaimWorkflowId) as DateClaimPended,                                     -- Pending Policy Admin

                                (Select Top 1 CONVERT(VARCHAR(8),StartDateTime,108) 
                                from Claim.ClaimWorkflow where claimStatusId in (4) And ClaimId = claim.ClaimId 
                                order by ClaimWorkflowId) as TimeClaimPended,   
                   
                                (Select Top 1 StartDateTime 
                                from Claim.ClaimWorkflow where claimStatusId in (1) And ClaimId = claim.ClaimId 
                                order by ClaimWorkflowId) as DateClaimCaptured, 
                   
                                (Select Top 1 CONVERT(VARCHAR(8),StartDateTime,108) 
                                from Claim.ClaimWorkflow 
                                where claimStatusId in (1) And ClaimId = claim.ClaimId 
                                order by ClaimWorkflowId) as TimeClaimCaptured,
                   
                                (select Top 1  bpm.CalculateOverAllSLATime(personevent.DateCaptured, StartDateTime )
                                                from claim.ClaimWorkflow 
                                                                where ClaimStatusId in (4) And ClaimId =  claim.claimId)
                                                As AVETimeFromClaimCapturedToClaimPended,   -- Pending Policy Admin

                                (Select Top 1 StartDateTime 
                                from Claim.ClaimWorkflow 
                                where claimStatusId in (4) And ClaimId = claim.ClaimId 
                                order by ClaimWorkflowId) as DateLastRequirementRecd,                      --Awaiting Decision : means All requirements recd

                                (Select Top 1 CONVERT(VARCHAR(8),StartDateTime,108) 
                                from Claim.ClaimWorkflow 
                                where claimStatusId in (4) And ClaimId = claim.ClaimId 
                                order by ClaimWorkflowId) as TimeLastRequirementRecd,

                                (select Top 1 bpm.CalculateOverAllSLATime(StartDateTime,EndDateTime) 
                                                                                                from Claim.ClaimWorkflow 
                                                                                                                                where claimStatusId in (4) and claimid = claim.ClaimId 
                                                                                                                order by ClaimWorkflowId desc) 
                                                                                As TimeFromClaimPendedToLastRequirementRecd,     --3: Pending Requirrements

                                (select Top 1 StartDateTime
                                from Claim.ClaimWorkflow where claimStatusId in (13) and claimid = claim.ClaimId 
                                order by ClaimWorkflowId desc) As DateClaimApproved,                                           --13 : Approved

                                (select Top 1 CONVERT(VARCHAR(8),StartDateTime,108) 
                                from Claim.ClaimWorkflow 
                                where claimStatusId in (13) and claimid = claim.ClaimId 
                                order by ClaimWorkflowId desc) As TimeClaimApproved,                                            --13 : Approved

                                (Select Top 1 StartDateAndTime 
                                                from Claim.ClaimWorkflow 
                                                where ClaimStatusId in (4) and ClaimId = claim.ClaimId 
                                order by ClaimWorkflowId desc) As DateLastRequirementReq,

                                (select Top 1  bpm.CalculateOverAllSLATime(
                                                                                (Select Top 1 StartDateAndTime 
                                                                                                from Claim.ClaimWorkflow where ClaimStatusId in (4) and ClaimId = claim.ClaimId 
                                                                                                order by ClaimWorkflowId desc) ,
                                                                                (select Top 1 StartDateTime  
                                                                                from Claim.ClaimWorkflow where claimStatusId in (13) and claimid = claim.ClaimId 
                                                                                order by ClaimWorkflowId desc)               )              )
                                                                As TimeFromLastrequirementRecdToClaimApproved,

                                (Select Top 1 EndDateAndTime from Claim.ClaimWorkflow 
                                where ClaimStatusId in (13) and ClaimId = claim.ClaimId 
                                order by ClaimWorkflowId desc) As DateClaimApproved1,

                                ( Select Top 1 StartDateTime from Claim.ClaimWorkflow 
                                where claimStatusId in (14) And ClaimId = claim.ClaimId 
                                order by ClaimWorkflowId)  [Date Claims Authorised],

                                (Select Top 1 CONVERT(VARCHAR(8),StartDateTime,108)
                                                from Claim.ClaimWorkflow 
                                                where claimStatusId in (14) And ClaimId = claim.ClaimId 
                                order by ClaimWorkflowId)         [Time Claim Authorised],

                               (select Top 1  bpm.CalculateOverAllSLATime((Select Top 1 StartDateAndTime 
                                                from Claim.ClaimWorkflow 
                                                where ClaimStatusId in (13) and ClaimId = claim.ClaimId 
                                order by ClaimWorkflowId ) ,

                                (select Top 1 StartDateTime 
                                                                from Claim.ClaimWorkflow 
                                                                                where claimStatusId in (14) and claimid = claim.ClaimId 
                                                                order by ClaimWorkflowId desc))              )                                                              [Average time from Claim Approved to Claim Authorised],

                                (Select Top 1 StartDateTime 
                                                from Claim.ClaimWorkflow 
                                                where claimStatusId in (10) And ClaimId = claim.ClaimId 
                                order by ClaimWorkflowId)         [Date Claim Declined],   

                                (Select Top 1 CONVERT(VARCHAR(8),StartDateTime,108)
                                                from Claim.ClaimWorkflow
                                                where claimStatusId in (10) And ClaimId = claim.ClaimId 
                                order by ClaimWorkflowId)[Time Claim Declined],

                                (select Top 1  bpm.CalculateOverAllSLATime((Select Top 1 StartDateAndTime 
                                                from Claim.ClaimWorkflow 
                                                where ClaimStatusId in (4) and ClaimId = claim.ClaimId 
                                order by ClaimWorkflowId ) ,

                                (select Top 1 CAST(StartDateTime As date) 
                                                                from Claim.ClaimWorkflow
                                                                                where claimStatusId in (27) and claimid = claim.ClaimId 
                                                                order by ClaimWorkflowId desc))              )                                                              [Average Time from Last Requirement received to Claim Declined],
                                
                                (Select Top 1 CAST(StartDateTime As date)
                                                from Claim.ClaimWorkflow where claimStatusId in (6) And (ClaimId = claim.ClaimId OR PersonEventId = personevent.PersonEventId)
                                order by ClaimWorkflowId)         [Date Claim Closed],

                                (Select Top 1 CONVERT(VARCHAR(8),StartDateTime,108)
                                                from Claim.ClaimWorkflow where claimStatusId in (6) And (ClaimId = claim.ClaimId OR PersonEventId = personevent.PersonEventId)
                                order by ClaimWorkflowId)         [Time Claim Closed],

                                (Select Top 1 CAST(StartDateTime As date)
                                                from Claim.ClaimWorkflow 
                                where claimStatusId in (20) And ClaimId = claim.ClaimId 
                                order by ClaimWorkflowId)                         [Date placed in Unclaimed Status],

                                (Select Top 1 CONVERT(VARCHAR(8),StartDateTime,108)
                                                from Claim.ClaimWorkflow 
                                                where claimStatusId in (20) And ClaimId = claim.ClaimId
                                                order by ClaimWorkflowId)         [Time placed in Unclaimed Status],
                                
                                (select Top 1  bpm.CalculateOverAllSLATime((Select Top 1 StartDateAndTime 
                                                from Claim.ClaimWorkflow 
                                                where ClaimStatusId in (20) and ClaimId = claim.ClaimId 
                                order by ClaimWorkflowId ) ,

                                (select Top 1 CAST(StartDateTime As date)
                                                from Claim.ClaimWorkflow where claimStatusId in (13) and claimid = claim.ClaimId 
                                                order by ClaimWorkflowId desc))              )    [Average time from Claim placed in unclaimed status to Approved],

                                (Select Top 1 CAST(StartDateTime As date)
                                                from Claim.ClaimWorkflow 
                                                where claimStatusId in (15) And ClaimId = claim.ClaimId 
                                order by ClaimWorkflowId)                                         [Date Claim re-opened],

                                (Select Top 1 CONVERT(VARCHAR(8),StartDateTime,108)
                                                from Claim.ClaimWorkflow 
                                                where claimStatusId in (15) And ClaimId = claim.ClaimId 
                                order by ClaimWorkflowId)         [Time claim re-opened],

                                (select Top 1  bpm.CalculateOverAllSLATime((Select Top 1 StartDateAndTime 
                                                from Claim.ClaimWorkflow 
                                                where ClaimStatusId in (6) and ClaimId = claim.ClaimId 
                                order by ClaimWorkflowId ) ,

                                (select Top 1 CAST(StartDateTime As date) 
                                                                                                from Claim.ClaimWorkflow 
                                                                                                                where claimStatusId in (15) and claimid = claim.ClaimId 
                                                                                                order by ClaimWorkflowId desc))              )              [Average time from claim closed to Claim re-opened],

                                (select Top 1  bpm.CalculateOverAllSLATime((
                                                Select Top 1 StartDateAndTime 
                                                                from Claim.ClaimWorkflow 
                                                where ClaimStatusId in (15) and ClaimId = claim.ClaimId 
                                order by ClaimWorkflowId ) ,

                                (select Top 1 CAST(StartDateTime As date) 
                                                                                from Claim.ClaimWorkflow 
                                                                                                                where claimStatusId in (14) and claimid = claim.ClaimId 
                                                                                order by ClaimWorkflowId desc))) [Average from Claim Re opened to Claim Authorised],

                                pay.PaymentConfirmationDate                                                                                                                                                                                                 [Date Claim Paid],

                                CONVERT(VARCHAR(8),pay.PaymentConfirmationDate,108)                                                                                                         [Time Claim Paid],

                                (select Top 1  bpm.CalculateOverAllSLATime
                                ((Select Top 1 StartDateTime 
                                                                                                                from Claim.ClaimWorkflow 
                                                                                                                                                where claimStatusId in (14) And ClaimId = claim.ClaimId 
                                                                                                                order by ClaimWorkflowId),pay.PaymentConfirmationDate)                )                              
                                                                                                [Average time from Claim Authorised to Claim Paid],        

                                --(select Top 1  bpm.[CalculateOverAllTAT](personevent.DateCaptured,(Select Top 1 CAST(StartDateTime As date)     --As per Andre OverAllSLA should be between "DateClaimCaptured" And "DateClaimPaid" 
                                --                                                             from Claim.ClaimWorkflow                                                                                                                                                                                                                                                                                          --but not "DateClaimClosed"
                                --                                                                                             where claimStatusId in (6) And ClaimId = claim.ClaimId 
                                --                                                                             order by ClaimWorkflowId)         )              )              
                                --                                                             [Overall SLA Per Claim],

                                --(select Top 1  bpm.[CalculateOverAllSLATimeElapsed](personevent.DateCaptured,pay.PaymentConfirmationDate))       
                                --                                                             [Overall SLA Per Claim],

                                (select Top 1  bpm.[CalculateOverAllSLATimeElapsed](personevent.DateCaptured,(Select Top 1 StartDateTime from Claim.ClaimWorkflow where claimStatusId in (14) And ClaimId = claim.ClaimId order by ClaimWorkflowId)))        
                                                                                                [Overall SLA Per Claim],

                                pay.Amount                                                                                                                                                                                                                                                                       [Amount Paid],

                  (select TOP 1 createddate from  [Campaign].[EmailAudit] (NOLOCK) emailAud 
                                                WHERE emailAud.ItemId = personevent.PersonEventId)                                                                                 [E-mail Date Successfully sent],

                   (SELECT TOP 1 createddate from  [Campaign].[smsAudit]           (NOLOCK) smsAud 
                                                where smsAud.ItemId = personevent.PersonEventId)                                                                                      [Date Sms Sucessfully sent]         ,


                   isnull(U.displayname,U1.displayname)                                                                                                                                                                                                [Assessor Name],
                   CASE WHEN CT.[Name] = '%Individual%' 
				   THEN CT.[Description] ELSE ICD.name END AS Class,
		
		ev.DateAdvised [Notification Date],	
							
			
		(select Top 1  bpm.CalculateOverAllSLATime(ev.DateAdvised,
													(select Top 1 StartDateTime from Claim.ClaimWorkflow 
													where claimStatusId in (14) and claimid = claim.ClaimId 
													order by ClaimWorkflowId desc)) 
													)[Average time from Claim Notified to Claim Authorised],

		(select Top 1  bpm.CalculateOverAllSLATime  (ev.DateAdvised,pay.PaymentConfirmationDate)
													) [Average time from Claim Notified  to Claim Paid]
													
                   --select count(*)
       FROM claim.PersonEvent personevent WITH (NOLOCK)

       INNER JOIN claim.PersonEventDeathDetail personeventdeath WITH (NOLOCK) 
                   ON personeventdeath.personeventid = personevent.personeventid

       INNER JOIN common.DeathType CDT WITH (NOLOCK) On CDT.Id = personeventdeath.DeathTypeId

       INNER JOIN bpm.Wizard wizard WITH (NOLOCK) ON personevent.EventId = wizard.LinkedItemId and wizard.WizardConfigurationId = 14 

       INNER JOIN bpm.WizardConfiguration WConfig WITH (NOLOCK) ON WConfig.Id = wizard.WizardConfigurationId

       INNER JOIN client.RolePlayer roleplayer ON roleplayer.RolePlayerId = PersonEvent.InsuredLifeId

       INNER JOIN Claim.Event ev  WITH (NOLOCK) ON ev.EventId = personevent.EventId

       LEFT JOIN claim.Claim claim WITH (NOLOCK) ON claim.PersonEventId = personevent.PersonEventId

       LEFT JOIN claim.ClaimInvoice CCI WITH (NOLOCK) ON CCI.ClaimId = claim.ClaimId

       LEFT JOIN claim.InvoiceAllocation CIA WITH (NOLOCK) ON CIA.ClaimInvoiceId = CCI.ClaimInvoiceId

       LEFT JOIN client.RolePlayer CRP WITH (NOLOCK) ON CRP.RolePlayerId = CIA.BeneificaryRolePlayerId

       --INNER JOIN claim.ClaimWorkFlow CCW1 WITH (NOLOCK) ON CCW1.ClaimId = claim.ClaimId

       LEFT JOIN client.person CPE WITH (NOLOCK) ON CPE.RolePlayerId = CRP.RolePlayerId

       LEFT JOIN claim.ClaimStatus claimstatus ON claimstatus.claimstatusid =claim.claimstatusid

       LEFT JOIN policy.PolicyInsuredLives pil WITH (NOLOCK) 
                   ON pil.RolePlayerId = personevent.InsuredLifeId AND claim.PolicyId = pil.PolicyId

       LEFT JOIN policy.Policy [policy] WITH (NOLOCK) 
                   ON policy.policyId = pil.PolicyId AND claim.PolicyId = pil.PolicyId

       LEFT JOIN broker.Brokerage BR WITH (NOLOCK) ON BR.Id = policy.BrokerageId

                   LEFT JOIN payment.payment pay (NOLOCK) ON pay.claimid = claim.claimid         
                                
                   LEFT JOIN [broker].[Representative] (NOLOCK)bpre ON bpre.Id =  policy.RepresentativeId

                   LEFT JOIN [product].[ProductOption] (NOLOCK) prod ON prod.id = policy.ProductOptionId

                   LEFT JOIN [product].[ProductOptionCoverType] (NOLOCK)prodCT ON  prodCT.ProductOptionId = policy.ProductOptionId AND policy.IsDeleted = 0

                   INNER JOIN [Common].[CoverType] CT (NOLOCK)ON ct.id = prodCT.covertypeid

       LEFT JOIN [security].[User] U WITH (NOLOCK) ON U.Id = claim.AssignedToUserId  

       LEFT JOIN [security].[User] U1 WITH (NOLOCK) ON U1.email = claim.createdby  
                   LEFT JOIN [policy].[Policy] papol (nolock) on paPol.PolicyId = [policy].ParentPolicyId
                   LEFT JOIN [client].[roleplayer] parp on parp.RolePlayerId = papol.policyOwnerId
                   left join Client.FinPayee cfp ON papol.[PolicyOwnerId] = cfp.RolePlayerID 
                   left join [common].[Industry] IC ON IC.Id =cfp.IndustryId
       left join [common].[IndustryClass] ICD ON ICD.Id =IC.IndustryClassId

                                WHERE personevent.CreatedDate BETWEEN @DateFrom AND @DateTo 
								AND 
								@SelectedProduct = CASE WHEN @CoverType = 0 THEN 'All'
								ELSE [CT].[Description]
								END
								--END
                                AND wizard.Name = 'New funeral claim: - ' + CAST(PersonEvent.PersonEventId AS VARCHAR(12)) 
                                AND claimstatus.ClaimStatusId IN (9,14)                 -- Adding this condition as per business (George Engelbrecht) : Authorised,Paid                           

                
END
GO