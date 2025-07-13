
create PROCEDURE [commission].[UpfrontCommCalcLife]
AS

EXECUTE commission.SP_UpfrontCommCalc 1;

/* REPORT 2    Get Life Level details for upfront Comm */
select 
    PC.PolicyNumber + '-' + convert(varchar(10), PC.LifeDOB )as lookup,
    PC.PolicyNumber ,
    MemberType, 
    LifeDOB,
    YearstoExit,
    CommissionablePremium,
    LTComm,
    YR85Comm,
    PrimaryComm,
    SecondaryComm,
   [Retention],
    CalcDate,
    PolicyInceptionDate,
    PI.PolicyCaptureDate,
    commstatus,
    PolicyCommissionID ,
    case When membertype='Main Member (self)' Then 1
    WHEN membertype='Spouse' then 2
    WHEN membertype='Child' then 3
    ELSE 4 END as 'SORT'

from commission.UpFrontCommissionCalc PC
inner join (select distinct policynumber, BrokerName, BrokerRepID, max(PolicyCaptureDate) as PolicyCaptureDate from commission.PolicyImport group by policynumber, BrokerName, BrokerRepID) PI 
on PI.policynumber=PC.PolicyNumber
order by pc.policynumber, memberrecord