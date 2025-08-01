CREATE proc [bpm].[GetFuneralPolicyCases]
as
begin
	select
	w.[Name] as 'PolicyCaseStatus',
	wc.DisplayName as 'PolicyCaseType',
	json_value(b.[Data], '$[0].code') as 'PolicyCase',
	ClientReference = json_value(b.[Data], '$[0].clientReference'),
	[PolicyNumber] = json_value(b.[Data], '$[0].mainMember.policies[0].policyNumber'),
	lower(b.CreatedBy)  [UserEmail],
	b.CreatedDate
	from bpm.Wizard b
	inner join common.WizardStatus w on w.Id = b.WizardStatusId
	inner join bpm.WizardConfiguration wc on wc.Id = b.WizardConfigurationId
	where b.WizardConfigurationId in (22,23)
	and b.IsDeleted = 0
	order by b.CreatedDate
end
