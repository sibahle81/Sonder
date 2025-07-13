export class ConstantApi {

    //Master data
    public static LookupConnectionTable = 'mdm/api';
    public static LookupUrl = 'mdm/api/Lookup';
    public static BankUrl = 'mdm/api/Bank';
    public static UploadsApiUrl = 'mdm/api/Uploads';
    public static ConfigurationApiUrl = 'mdm/api/Configuration';
    public static MasterDataAuditLogApiUrl = 'mdm/api/AuditLog';
    public static MasterDataApiAddress = `mdm/api/City`;
    public static DocumentCategoryApi = 'mdm/api/DocumentCategory';
    public static RequiredDocumentApi = 'mdm/api/RequiredDocument';
    public static DocumentCategoryTypeApi = 'mdm/api/DocumentCategoryType';
    public static GenerateDocumentApi = 'mdm/api/GenerateDocument';

    //Security
    public static UserRegistration = 'sec/api/UserRegistration';
    public static WizardApiUrl = 'sec/api/UserWizard';
    public static TenantApiUrl = 'sec/api/tenant';
    public static UserApiUrl = 'sec/api/User';
    public static SecurityAuditLogApiUrl = 'sec/api/AuditLog';

    //Client
    public static ClientApiBankAccount = 'clc/api/Client/BankAccount';
    public static ClientManagerAuditLogApiUrl = 'clc/api/Client/AuditLog';

    //Policy
    public static PolicyManagerAuditLogApiUrl = 'clc/api/Policy/AuditLog';
    public static PolicyApiUrl = 'clc/api/policy/policy';
    public static insuredLifeUrl = 'clc/api/Policy/InsuredLife';
    public static PremiumListingFileUrl = 'clc/api/Policy/PremiumListingFileAudit';

    //Lead
    public static LeadApiLeadsAccount = 'clc/api/Lead/BankAccount';
    public static LeadManagerAuditLogApiUrl = 'clc/api/Lead/AuditLog';

    //BPM
    public static WizardConfigurationApiUrl = 'bpm/api/WizardConfiguration';
    public static AuditLogApiUrl = 'bpm/api/AuditLog';
    public static BusinessProcessManagerAuditLogApiUrl = 'bpm/api/AuditLog';
    public static wizardUrl = 'bpm/api/wizard';

    //Finance
    public static BillingManagerAuditLogApiUrl = 'fin/api/Billing/AuditLog';
    public static PaymentManagerAuditLogApiUrl = 'fin/api/AuditLog';

    //Broker
    public static BrokerageManagerAuditLogApiUrl = 'clc/api/Broker/AuditLog';
    public static BrokerageApi = 'clc/api/Broker/Brokerage';
    public static RepresentativeApi = 'clc/api/Broker/Representative';

    //Product
    public static ProductOptionApi = 'clc/api/Product/ProductOption';
    public static ProductOptionRuleApi = 'clc/api/Product/ProductOptionRule';
    public static ProductApi = 'clc/api/Product/Product';
    public static ProductBatchApi = 'clc/api/Product/ProductBatch';
    public static ProductRuleApi = 'clc/api/product/productRule';
    public static ProductManagerAuditLogApiUrl = 'clc/api/Product/AuditLog';

    //Claims
    public static ClaimApiUrl = 'clm/api/claim';
    public static ClaimManagerAuditLogApiUrl = 'clm/api/AuditLog';

    //CMP
    public static CampaignManagerAuditLogApiUrl = 'cmp/api/AuditLog';
    public static CampaignManagerEmailApiUrl = 'cmp/api/Email';
    public static CampaignManagerSendEmailApiUrl = 'cmp/api/SendEmail/Send';
    public static CampaignManagerSmsApiUrl = 'cmp/api/SendSms';
    public static CampaignManagerSendSmsApiUrl = 'cmp/api/SendSms/Send';

    //RolePlayer
    public static RolePlayerUrl = 'clc/api/RolePlayer/RolePlayer';
    public static RolePlayerPolicyUrl = 'clc/api/RolePlayer/RolePlayerPolicy';

    //Hyphen
    public static HyphenApi = 'int/api/hyphen';

    public static DocumentApiUrl = 'scn/api/Document/Document';
    public static MemberPortalApiUrl = 'mpm/api/Configuration';
    public static DefaultCommonReport = 'RMA.Reports.Common/Placeholder';
    public static PolicyReportUrl = 'RMA.Reports.ClientCare.Policy/';
    public static BillingInvoice = 'bill/api/billing/invoice';
}
