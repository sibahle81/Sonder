using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Enums.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Database.Entities;

using System;
using System.Collections;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class PolicyMonitoringFacade : RemotingStatelessService, IPolicyMonitoringService
    {
        private readonly IRepository<policy_Policy> _policyRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<client_RolePlayer> _rolePlayerRepository;
        private readonly IRepository<product_BenefitRate> _benefitRateRepository;
        private readonly IWizardService _wizardService;
        private readonly ISerializerService _serializer;
        private readonly IPolicyCaseService _policyCaseService;
        private readonly IRepository<policy_PolicyInsuredLife> _insuredLifeRepository;

        public PolicyMonitoringFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory, IRepository<policy_Policy> policyRepository,
            IRepository<client_RolePlayer> rolePlayerRepository,
            IRepository<product_BenefitRate> benefitRateRepository,
            IWizardService wizardService,
            ISerializerService serializer, IPolicyCaseService policyCaseService,
            IRepository<policy_PolicyInsuredLife> insuredLifeRepository) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _policyRepository = policyRepository;
            _rolePlayerRepository = rolePlayerRepository;

            _benefitRateRepository = benefitRateRepository;
            _wizardService = wizardService;
            _serializer = serializer;
            _policyCaseService = policyCaseService;
            _insuredLifeRepository = insuredLifeRepository;
        }

        public async Task<bool> MonitorChildAge()
        {

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var insuredLives = await _rolePlayerRepository
                    .Where(p => p.PolicyInsuredLives.Any(a => a.StatedBenefitId != null && a.RolePlayerTypeId == (int)RolePlayerTypeEnum.Child))
                    .Select(s => new { s.Person, s.PolicyInsuredLives }).ToListAsync();

                foreach (var child in insuredLives)
                {
                    if (child.Person == null)
                        continue;

                    if (child.Person.DateOfBirth.Day == DateTime.Now.AddDays(-30).Day && child.Person.DateOfBirth.Month == DateTime.Now.AddDays(-30).Month)
                    {
                        double age = DateTime.Now.Year - child.Person.DateOfBirth.Year;
                        foreach (var childBenefit in child.PolicyInsuredLives)
                        {
                            if (childBenefit.StatedBenefitId == 0) continue;
                            var benefit = await _benefitRateRepository.Where(a => a.BenefitId == childBenefit.StatedBenefitId).ToListAsync();
                            var amount = benefit.Sum(a => a.BenefitAmount);

                            if (age <= 6 && amount > 20000)
                            {
                                var rolePlayer = await _policyCaseService.GetCaseByPolicyId(childBenefit.PolicyId);
                                var stepData = new ArrayList() { rolePlayer };
                                var converion = ConvertDataToJson(stepData);
                                var wizard = new StartWizardRequest() { Data = converion, Type = "ManagePolicy", LinkedItemId = -1 };
                                await _wizardService.StartWizard(wizard);
                            }

                            if (age > 6 && age < 14 && amount > 50000)
                            {
                                var rolePlayer = await _policyCaseService.GetCaseByPolicyId(childBenefit.PolicyId);
                                var stepData = new ArrayList() { rolePlayer };
                                var converion = ConvertDataToJson(stepData);
                                var wizard = new StartWizardRequest() { Data = converion, Type = "ManagePolicy", LinkedItemId = -1 };
                                await _wizardService.StartWizard(wizard);
                            }
                            if (age >= 14 && amount > 100000)
                            {
                                var rolePlayer = await _policyCaseService.GetCaseByPolicyId(childBenefit.PolicyId);
                                var stepData = new ArrayList() { rolePlayer };
                                var converion = ConvertDataToJson(stepData);
                                var wizard = new StartWizardRequest() { Data = converion, Type = "ManagePolicy", LinkedItemId = -1 };
                                await _wizardService.StartWizard(wizard);
                            }
                        }
                    }
                }
            }
            return await Task.FromResult(true);

        }
        public async Task<bool> MonitorAnniversary()
        {

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var dayAnni = DateTime.Now.AddDays(-30).Day;
                var monthAnni = DateTime.Now.AddDays(-30).Month;

                var anniversaryPolicy = await _policyRepository.Where(a => a.PolicyInceptionDate.Day == dayAnni && a.PolicyInceptionDate.Month == monthAnni).ToListAsync();
                await _policyRepository.LoadAsync(anniversaryPolicy, rp => rp.PolicyOwner);
                foreach (var policy in anniversaryPolicy)
                {
                    var rolePlayer = await _policyCaseService.GetCaseByPolicyId(policy.PolicyId);
                    var stepData = new ArrayList() { rolePlayer };
                    var converion = ConvertDataToJson(stepData);
                    var wizard = new StartWizardRequest() { Data = converion, Type = "ManagePolicy", LinkedItemId = -1 };
                    await _wizardService.StartWizard(wizard);
                }

                return await Task.FromResult(anniversaryPolicy.Count > 0);
            }

        }

        private string ConvertDataToJson(ArrayList stepData)
        {
            if (stepData == null) return null;

            var jsonStepData = Serialize(stepData);
            jsonStepData = jsonStepData.Replace("\\", "");

            return jsonStepData;
        }
        public string Serialize<T>(T obj)
        {
            return _serializer.Serialize(obj);
        }
        public async Task<bool> MonitorPremiumWaivedChildren()
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var insuredChildren = await _insuredLifeRepository.Where(c => c.RolePlayerTypeId == (int)RolePlayerTypeEnum.Child && c.InsuredLifeStatus == InsuredLifeStatusEnum.PremiumWaived && c.EndDate == null).ToListAsync();
                if (insuredChildren.Count > 0)
                {
                    var childIds = insuredChildren.Select(c => c.RolePlayerId).ToList();
                    var children = await _rolePlayerRepository.Where(c => childIds.Contains(c.RolePlayerId)).ToListAsync();
                    await _rolePlayerRepository.LoadAsync(children, c => c.Person);
                    foreach (var child in children)
                    {
                        if (CalculateAge(child.Person.DateOfBirth) >= 21)
                        {
                            var insuredChild = insuredChildren.Where(c => c.RolePlayerId == child.RolePlayerId).FirstOrDefault();
                            if (insuredChild != null)
                            {
                                insuredChild.EndDate = DateTime.Now;
                                insuredChild.InsuredLifeRemovalReason = InsuredLifeRemovalReasonEnum.MemberChildNoLongerQualifies;
                            }
                            _insuredLifeRepository.Update(insuredChild);
                        }
                    }
                }
                await scope.SaveChangesAsync();
            }
            return await Task.FromResult(true);
        }
        private int CalculateAge(DateTime dateOfBirth)
        {
            int years = DateTime.Now.Year - dateOfBirth.Year;
            dateOfBirth = dateOfBirth.AddYears(years);
            if (dateOfBirth.Date > DateTime.Now.Date)
                years--;
            return years;
        }

    }
}
