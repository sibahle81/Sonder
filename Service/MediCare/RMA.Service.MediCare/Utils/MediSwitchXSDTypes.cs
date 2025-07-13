using System.Xml.Serialization;

namespace RMA.Service.MediCare.Utils
{

    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.0.30319.18020")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [XmlType(AnonymousType = true)]
    [XmlRoot(Namespace = "", IsNullable = false)]
    public partial class FinancialTransaction
    {
        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Gross { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Nett { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Discount { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Vat { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string DispensingFee { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string TransactionDate { get; set; }
    }

    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.0.30319.18020")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [XmlType(AnonymousType = true)]
    [XmlRoot(Namespace = "", IsNullable = false)]
    public partial class Message
    {
        /// <remarks/>
        [XmlElement("MessageHeader", Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public MessageMessageHeader MessageHeader { get; set; }

        /// <remarks/>
        [XmlElement("MessageContents", Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public MessageMessageContents MessageContents { get; set; }

        /// <remarks/>
        [XmlAttribute()]
        public string QuickId { get; set; }
    }

    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.0.30319.18020")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [XmlType(AnonymousType = true)]
    public partial class MessageMessageHeader
    {
        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Domain { get; set; }

        /// <remarks/>
        [XmlElement("MessageId", Form = System.Xml.Schema.XmlSchemaForm.Unqualified, IsNullable = true)]
        public MessageMessageHeaderMessageId MessageId { get; set; }

        /// <remarks/>
        [XmlElement("Currency", Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public MessageMessageHeaderCurrency Currency { get; set; }

        /// <remarks/>
        [XmlElement("Key", Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public MessageMessageHeaderKey Key { get; set; }

        /// <remarks/>
        [XmlElement("Connection", Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public MessageMessageHeaderConnection Connection { get; set; }
    }

    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.0.30319.18020")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [XmlType(AnonymousType = true)]
    public partial class MessageMessageHeaderMessageId
    {
        /// <remarks/>
        [XmlAttribute()]
        public string Owner { get; set; }

        /// <remarks/>
        [XmlAttribute()]
        public string Type { get; set; }

        /// <remarks/>
        [XmlText()]
        public string Value { get; set; }
    }

    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.0.30319.18020")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [XmlType(AnonymousType = true)]
    public partial class MessageMessageHeaderCurrency
    {
        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Denomination { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Units { get; set; }
    }

    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.0.30319.18020")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [XmlType(AnonymousType = true)]
    public partial class MessageMessageHeaderKey
    {
        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string From { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string To { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string TimeStamp { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string SwitchReferenceNum { get; set; }

        /// <remarks/>
        [XmlAttribute()]
        public string Owner { get; set; }
    }

    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.0.30319.18020")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [XmlType(AnonymousType = true)]
    public partial class MessageMessageHeaderConnection
    {
        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Mode { get; set; }
    }

    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.0.30319.18020")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [XmlType(AnonymousType = true)]
    public partial class MessageMessageContents
    {
        /// <remarks/>
        [XmlElement("Document", Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public MessageMessageContentsDocument[] Document { get; set; }

        /// <remarks/>
        [XmlAttribute()]
        public string TotalDocs { get; set; }
    }

    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.0.30319.18020")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [XmlType(AnonymousType = true)]
    public partial class MessageMessageContentsDocument
    {
        /// <remarks/>
        [XmlElement("ServiceProvider", Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public MessageMessageContentsDocumentServiceProvider ServiceProvider { get; set; }

        /// <remarks/>
        [XmlElement("Member", Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public MessageMessageContentsDocumentMember Member { get; set; }

        /// <remarks/>
        [XmlElement("Patient", Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public MessageMessageContentsDocumentPatient Patient { get; set; }

        /// <remarks/>
        [XmlElement("FinancialTransaction")]
        public FinancialTransaction FinancialTransaction { get; set; }

        /// <remarks/>
        [XmlElement("ServiceEvent", Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public MessageMessageContentsDocumentServiceEvent ServiceEvent { get; set; }

        /// <remarks/>
        [XmlAttribute()]
        public string SequenceNum { get; set; }

        /// <remarks/>
        [XmlAttribute()]
        public string Type { get; set; }

        /// <remarks/>
        [XmlAttribute()]
        public string Format { get; set; }
    }

    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.0.30319.18020")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [XmlType(AnonymousType = true)]
    public partial class MessageMessageContentsDocumentServiceProvider
    {
        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string BhfId { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string PracticeName { get; set; }

        /// <remarks/>
        [XmlElement("PostalAddress", Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public MessageMessageContentsDocumentServiceProviderPostalAddress[] PostalAddress { get; set; }
    }

    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.0.30319.18020")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [XmlType(AnonymousType = true)]
    public partial class MessageMessageContentsDocumentServiceProviderPostalAddress
    {
        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string AddressLine1 { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string AddressLine2 { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string TownCity { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string PostalCode { get; set; }
    }

    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.0.30319.18020")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [XmlType(AnonymousType = true)]
    public partial class MessageMessageContentsDocumentMember
    {
        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Title { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Name { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Initials { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Surname { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string NationalId { get; set; }

        /// <remarks/>
        [XmlElement("MedicalAid", Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public MessageMessageContentsDocumentMemberMedicalAid MedicalAid { get; set; }
    }

    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.0.30319.18020")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [XmlType(AnonymousType = true)]
    public partial class MessageMessageContentsDocumentMemberMedicalAid
    {
        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string MemberNum { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string PlanName { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string PlanId { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string MemberRelationToPatient { get; set; }
    }

    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.0.30319.18020")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [XmlType(AnonymousType = true)]
    public partial class MessageMessageContentsDocumentPatient
    {
        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string DependantCode { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Name { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Initials { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Surname { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string AdministrativeGender { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string DateTimeOfBirth { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string ServiceProviderReference { get; set; }

        /// <remarks/>
        [XmlElement("Identification", Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public MessageMessageContentsDocumentPatientIdentification Identification { get; set; }
    }

    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.0.30319.18020")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [XmlType(AnonymousType = true)]
    public partial class MessageMessageContentsDocumentPatientIdentification
    {
        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Type { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string ReferenceCode { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string IssuingAuthority { get; set; }
    }

    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.0.30319.18020")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [XmlType(AnonymousType = true)]
    public partial class MessageMessageContentsDocumentServiceEvent
    {
        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string EventReferenceNum { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string EventType { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string MedAidReferenceNum { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string HospitalIndicator { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string AdmissionDateTime { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string DischargeDateTime { get; set; }

        /// <remarks/>
        [XmlElement("FinancialTransaction")]
        public FinancialTransaction FinancialTransaction { get; set; }

        /// <remarks/>
        [XmlElement("Practitioner", Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public MessageMessageContentsDocumentServiceEventPractitioner Practitioner { get; set; }

        /// <remarks/>
        [XmlElement("Iod", Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public MessageMessageContentsDocumentServiceEventIod Iod { get; set; }

        /// <remarks/>
        [XmlElement("ServiceItem", Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public MessageMessageContentsDocumentServiceEventServiceItem[] ServiceItem { get; set; }
    }

    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.0.30319.18020")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [XmlType(AnonymousType = true)]
    public partial class MessageMessageContentsDocumentServiceEventPractitioner
    {
        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Role { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string PractitionerName { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string BhfId { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string HpcsaId { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Discipline { get; set; }
    }

    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.0.30319.18020")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [XmlType(AnonymousType = true)]
    public partial class MessageMessageContentsDocumentServiceEventIod
    {
        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Employee { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Employer { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string IodDateTime { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string IodReference { get; set; }
    }

    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.0.30319.18020")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [XmlType(AnonymousType = true)]
    public partial class MessageMessageContentsDocumentServiceEventServiceItem
    {
        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string ItemNum { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string ItemType { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Resubmit { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string ChargeDescription { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string ChargeStartDateTime { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string ChargeEndDateTime { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string ChargeQuantity { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string HospitalIndicator { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string PlaceOfServiceCode { get; set; }

        /// <remarks/>
        [XmlElement("Variable", Form = System.Xml.Schema.XmlSchemaForm.Unqualified, IsNullable = true)]
        public MessageMessageContentsDocumentServiceEventServiceItemVariable Variable { get; set; }

        /// <remarks/>
        [XmlElement("ChargeCode", Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public MessageMessageContentsDocumentServiceEventServiceItemChargeCode ChargeCode { get; set; }

        /// <remarks/>
        [XmlElement("FinancialTransaction")]
        public FinancialTransaction FinancialTransaction { get; set; }

        /// <remarks/>
        [XmlElement("Diagnosis", Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public MessageMessageContentsDocumentServiceEventServiceItemDiagnosis[] Diagnosis { get; set; }

        /// <remarks/>
        [XmlElement("Authorisation", Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public MessageMessageContentsDocumentServiceEventServiceItemAuthorisation Authorisation { get; set; }

        /// <remarks/>
        [XmlElement("ProductCode", Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public MessageMessageContentsDocumentServiceEventServiceItemProductCode ProductCode { get; set; }

        /// <remarks/>
        [XmlElement("Comment", Form = System.Xml.Schema.XmlSchemaForm.Unqualified, IsNullable = true)]
        public MessageMessageContentsDocumentServiceEventServiceItemComment[] Comment { get; set; }
    }

    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.0.30319.18020")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [XmlType(AnonymousType = true)]
    public partial class MessageMessageContentsDocumentServiceEventServiceItemVariable
    {
        /// <remarks/>
        [XmlAttribute()]
        public string Owner { get; set; }

        /// <remarks/>
        [XmlAttribute()]
        public string Name { get; set; }

        /// <remarks/>
        [XmlText()]
        public string Value { get; set; }
    }

    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.0.30319.18020")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [XmlType(AnonymousType = true)]
    public partial class MessageMessageContentsDocumentServiceEventServiceItemChargeCode
    {
        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Identifier { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string NameOfCodingSystem { get; set; }

        /// <remarks/>
        [XmlElement("Modifier", Form = System.Xml.Schema.XmlSchemaForm.Unqualified, IsNullable = true)]
        public MessageMessageContentsDocumentServiceEventServiceItemChargeCodeModifier[] Modifier { get; set; }
    }

    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.0.30319.18020")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [XmlType(AnonymousType = true)]
    public partial class MessageMessageContentsDocumentServiceEventServiceItemChargeCodeModifier
    {
        /// <remarks/>
        [XmlText()]
        public string Value { get; set; }
    }

    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.0.30319.18020")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [XmlType(AnonymousType = true)]
    public partial class MessageMessageContentsDocumentServiceEventServiceItemDiagnosisDiagnosisCode
    {
        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Identifier { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string NameOfCodingSystem { get; set; }
    }

    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.0.30319.18020")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [XmlType(AnonymousType = true)]
    public partial class MessageMessageContentsDocumentServiceEventServiceItemAuthorisation
    {
        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string AuthorisationIdentifier { get; set; }
    }

    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.0.30319.18020")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [XmlType(AnonymousType = true)]
    public partial class MessageMessageContentsDocumentServiceEventServiceItemProductCode
    {
        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Identifier { get; set; }

        /// <remarks/>
        [XmlElement(Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string NameOfCodingSystem { get; set; }
    }

    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.0.30319.18020")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [XmlType(AnonymousType = true)]
    public partial class MessageMessageContentsDocumentServiceEventServiceItemComment
    {
        /// <remarks/>
        [XmlText()]
        public string Value { get; set; }
    }

    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.0.30319.18020")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [XmlType(AnonymousType = true)]
    [XmlRoot(Namespace = "", IsNullable = false)]
    public partial class NewDataSet
    {
        /// <remarks/>
        [XmlElement("FinancialTransaction", typeof(FinancialTransaction)), XmlElement("Message", typeof(Message))]
        public object[] Items { get; set; }
    }

    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.0.30319.18020")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [XmlType(AnonymousType = true)]
    public class MessageMessageContentsDocumentServiceEventServiceItemDiagnosis
    {
        /// <remarks/>
        [XmlElement("DiagnosisCode", Form = System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public MessageMessageContentsDocumentServiceEventServiceItemDiagnosisDiagnosisCode DiagnosisCode { get; set; }
    }

}
