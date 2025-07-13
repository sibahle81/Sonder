using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.Interfaces;

using Serilog;

using System;
using System.Collections;
using System.Threading.Tasks;

namespace RMA.Service.Admin.BusinessProcessManager.SDK
{
    internal class WizardContext : IWizardContext
    {
        private readonly IRuleEngineService _rulesEngine;
        private readonly ISerializerService _serializer;
        private readonly IWizardConfigurationService _wizardConfigurationService;
        private readonly IWizardService _wizardService;
        private StartWizardRequest _startWizardRequest;

        public WizardContext(IRuleEngineService rulesEngine,
            ISerializerService serializer,
            IWizardConfigurationService wizardConfigurationService,
            IWizardService wizardService
        )
        {
            _rulesEngine = rulesEngine;
            _serializer = serializer;
            _wizardConfigurationService = wizardConfigurationService;
            _wizardService = wizardService;
        }

        public string Type => _startWizardRequest.Type;

        public int LinkedItemId => _startWizardRequest.LinkedItemId;

        public DateTime? OverrideStartDateAndTime => _startWizardRequest.OverrideStartDateAndTime ?? DateTime.Now;

        public string Data
        {
            get => _startWizardRequest.Data;
            set => _startWizardRequest.Data = value;
        }

        public Task<int> CreateWizard(string name, ArrayList stepData, WizardStatusEnum wizardStatus)
        {
            return CreateWizardAsync(name, stepData, wizardStatus);
        }

        public int CreateWizard(string name, ArrayList stepData, string lockedToUser, string customStatus,
            int customRoutingRoleId)
        {
            return CreateWizardAsync(name, stepData, lockedToUser, customStatus, customRoutingRoleId, WizardStatusEnum.New)
                .RunTaskSynchronously();
        }

        public async Task<int> CreateWizardAsync(string name, ArrayList stepData, WizardStatusEnum wizardStatus)
        {
            return await CreateWizardAsync(name, stepData, null, null, 0, wizardStatus);
        }

        public async Task<int> CreateWizardAsync(string name, ArrayList stepData, string lockedToUser)
        {
            var wizardConfiguration = await _wizardConfigurationService.GetWizardConfigurationByName(Type);
            if (wizardConfiguration == null) throw new BusinessException($"Could not find the wizard configuration: {Type}");
            var jsonStepData = ConvertDataToJson(stepData);

            var modelWizard = new Wizard
            {
                WizardConfigurationId = wizardConfiguration.Id,
                WizardConfiguration = wizardConfiguration,
                LinkedItemId = LinkedItemId,
                WizardStatus = WizardStatusEnum.New,
                LockedToUser = lockedToUser,
                Name = name,
                Data = jsonStepData,
                StartDateAndTime = OverrideStartDateAndTime
            };

            return await _wizardService.AddWizard(modelWizard);
        }

        public async Task<int> CreateWizardAsync(string name, ArrayList stepData, string lockedToUser,
            string customStatus,
            int customRoutingRoleId, WizardStatusEnum wizardStatus)
        {
            var wizardConfiguration = await _wizardConfigurationService.GetWizardConfigurationByName(Type);
            if (wizardConfiguration == null) throw new BusinessException($"Could not find the wizard configuration: {Type}");
            var jsonStepData = ConvertDataToJson(stepData);

            var modelWizard = new Wizard
            {
                WizardConfigurationId = wizardConfiguration.Id,
                WizardConfiguration = wizardConfiguration,
                LinkedItemId = LinkedItemId,
                WizardStatus = wizardStatus,
                Name = name,
                Data = jsonStepData,
                StartDateAndTime = OverrideStartDateAndTime
            };

            SetCustomAndDefaultSettings(modelWizard, lockedToUser, customStatus, customRoutingRoleId);
            return await _wizardService.AddWizard(modelWizard);
        }

        public T Deserialize<T>(string json)
        {
            return _serializer.Deserialize<T>(json);
        }

        public void LogError(Exception ex)
        {
            Log.Logger.Error(ex, "Wizard Error");
        }

        public bool RequestInitiatedByBackgroundProcess { get; set; }

        public async Task UpdateWizard(Wizard wizard)
        {
            await this._wizardService.UpdateWizard(wizard);
        }

        public string Serialize<T>(T obj)
        {
            return _serializer.Serialize(obj);
        }

        public void Init(StartWizardRequest startWizardRequest)
        {
            _startWizardRequest = startWizardRequest;
        }

        private string ConvertDataToJson(ArrayList stepData)
        {
            if (stepData == null) return null;

            var jsonStepData = Serialize(stepData);
            jsonStepData = jsonStepData.Replace("\\\"", "~");
            jsonStepData = jsonStepData.Replace("\\", "");
            jsonStepData = jsonStepData.Replace("~", "\\\"");

            return jsonStepData;
        }

        private void SetCustomAndDefaultSettings(Wizard modelWizard, string lockedToUser, string customStatus,
            int customRoutingRoleId)
        {
            if (!string.IsNullOrWhiteSpace(_startWizardRequest.LockedToUser))
                modelWizard.LockedToUser = _startWizardRequest.LockedToUser;

            if (!string.IsNullOrWhiteSpace(lockedToUser))
                modelWizard.LockedToUser = lockedToUser;

            if (!string.IsNullOrWhiteSpace(_startWizardRequest.CustomStatus))
                modelWizard.CustomStatus = _startWizardRequest.CustomStatus;

            if (!string.IsNullOrWhiteSpace(customStatus))
                modelWizard.CustomStatus = customStatus;

            if (_startWizardRequest.CustomRoutingRoleId > 0)
                modelWizard.CustomRoutingRoleId = _startWizardRequest.CustomRoutingRoleId;

            if (customRoutingRoleId > 0)
                modelWizard.CustomRoutingRoleId = customRoutingRoleId;
        }

        public async Task<RuleRequestResult> ExecuteRules(RuleRequest ruleRequest)
        {
            return await _rulesEngine.ExecuteRules(ruleRequest);
        }
    }
}
