﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.42000
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using System.Xml.Serialization;

// 
// This source code was auto-generated by xsd, Version=4.6.1055.0.
// 


/// <remarks/>
[System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
[System.SerializableAttribute()]
[System.Diagnostics.DebuggerStepThroughAttribute()]
[System.ComponentModel.DesignerCategoryAttribute("code")]
[System.Xml.Serialization.XmlTypeAttribute(AnonymousType=true)]
[System.Xml.Serialization.XmlRootAttribute(Namespace="", IsNullable=false)]
public partial class IndividualPolicySchedule {
    
    private string policyHolderNameField;
    
    private string policyHolderSurnameField;
    
    private string policyHolderAddressField;
    
    private string policyHolderPostalCodeField;
    
    private System.DateTime documentDateField;
    
    private System.DateTime policyStartDateField;
    
    private System.DateTime anniversaryDateField;
    
    private System.DateTime issueDateField;
    
    private string commissionAmountField;
    
    private string benefitField;
    
    private System.DateTime commenceDateField;
    
    private decimal administrationFeeField;
    
    private System.DateTime applicationDateField;
    
    private string policyNumberField;
    
    private string paymentMethodField;
    
    private string policyNameField;
    
    private string premiumField;
    
    private IndividualPolicyScheduleMainMember mainMemberField;
    
    private IndividualPolicyScheduleSpouse spouseField;
    
    private IndividualPolicyScheduleChildren childrenField;
    
    private IndividualPolicyScheduleExtendedFamily extendedFamilyField;
    
    private IndividualPolicyScheduleBeneficiaries beneficiariesField;
    
    /// <remarks/>
    public string policyHolderName {
        get {
            return this.policyHolderNameField;
        }
        set {
            this.policyHolderNameField = value;
        }
    }
    
    /// <remarks/>
    public string policyHolderSurname {
        get {
            return this.policyHolderSurnameField;
        }
        set {
            this.policyHolderSurnameField = value;
        }
    }
    
    /// <remarks/>
    public string policyHolderAddress {
        get {
            return this.policyHolderAddressField;
        }
        set {
            this.policyHolderAddressField = value;
        }
    }
    
    /// <remarks/>
    public string policyHolderPostalCode {
        get {
            return this.policyHolderPostalCodeField;
        }
        set {
            this.policyHolderPostalCodeField = value;
        }
    }
    
    /// <remarks/>
    [System.Xml.Serialization.XmlElementAttribute(DataType="date")]
    public System.DateTime documentDate {
        get {
            return this.documentDateField;
        }
        set {
            this.documentDateField = value;
        }
    }
    
    /// <remarks/>
    [System.Xml.Serialization.XmlElementAttribute(DataType="date")]
    public System.DateTime policyStartDate {
        get {
            return this.policyStartDateField;
        }
        set {
            this.policyStartDateField = value;
        }
    }
    
    /// <remarks/>
    [System.Xml.Serialization.XmlElementAttribute(DataType="date")]
    public System.DateTime anniversaryDate {
        get {
            return this.anniversaryDateField;
        }
        set {
            this.anniversaryDateField = value;
        }
    }
    
    /// <remarks/>
    [System.Xml.Serialization.XmlElementAttribute(DataType="date")]
    public System.DateTime issueDate {
        get {
            return this.issueDateField;
        }
        set {
            this.issueDateField = value;
        }
    }
    
    /// <remarks/>
    public string commissionAmount {
        get {
            return this.commissionAmountField;
        }
        set {
            this.commissionAmountField = value;
        }
    }
    
    /// <remarks/>
    public string benefit {
        get {
            return this.benefitField;
        }
        set {
            this.benefitField = value;
        }
    }
    
    /// <remarks/>
    [System.Xml.Serialization.XmlElementAttribute(DataType="date")]
    public System.DateTime commenceDate {
        get {
            return this.commenceDateField;
        }
        set {
            this.commenceDateField = value;
        }
    }
    
    /// <remarks/>
    public decimal administrationFee {
        get {
            return this.administrationFeeField;
        }
        set {
            this.administrationFeeField = value;
        }
    }
    
    /// <remarks/>
    [System.Xml.Serialization.XmlElementAttribute(DataType="date")]
    public System.DateTime applicationDate {
        get {
            return this.applicationDateField;
        }
        set {
            this.applicationDateField = value;
        }
    }
    
    /// <remarks/>
    public string policyNumber {
        get {
            return this.policyNumberField;
        }
        set {
            this.policyNumberField = value;
        }
    }
    
    /// <remarks/>
    public string paymentMethod {
        get {
            return this.paymentMethodField;
        }
        set {
            this.paymentMethodField = value;
        }
    }
    
    /// <remarks/>
    public string policyName {
        get {
            return this.policyNameField;
        }
        set {
            this.policyNameField = value;
        }
    }
    
    /// <remarks/>
    public string premium {
        get {
            return this.premiumField;
        }
        set {
            this.premiumField = value;
        }
    }
    
    /// <remarks/>
    public IndividualPolicyScheduleMainMember mainMember {
        get {
            return this.mainMemberField;
        }
        set {
            this.mainMemberField = value;
        }
    }
    
    /// <remarks/>
    public IndividualPolicyScheduleSpouse spouse {
        get {
            return this.spouseField;
        }
        set {
            this.spouseField = value;
        }
    }
    
    /// <remarks/>
    public IndividualPolicyScheduleChildren children {
        get {
            return this.childrenField;
        }
        set {
            this.childrenField = value;
        }
    }
    
    /// <remarks/>
    public IndividualPolicyScheduleExtendedFamily extendedFamily {
        get {
            return this.extendedFamilyField;
        }
        set {
            this.extendedFamilyField = value;
        }
    }
    
    /// <remarks/>
    public IndividualPolicyScheduleBeneficiaries beneficiaries {
        get {
            return this.beneficiariesField;
        }
        set {
            this.beneficiariesField = value;
        }
    }
}

/// <remarks/>
[System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
[System.SerializableAttribute()]
[System.Diagnostics.DebuggerStepThroughAttribute()]
[System.ComponentModel.DesignerCategoryAttribute("code")]
[System.Xml.Serialization.XmlTypeAttribute(AnonymousType=true)]
public partial class IndividualPolicyScheduleMainMember {
    
    private IndividualPolicyScheduleMainMemberMember[] memberField;
    
    private string formatField;
    
    private string headersField;
    
    /// <remarks/>
    [System.Xml.Serialization.XmlElementAttribute("member")]
    public IndividualPolicyScheduleMainMemberMember[] member {
        get {
            return this.memberField;
        }
        set {
            this.memberField = value;
        }
    }
    
    /// <remarks/>
    [System.Xml.Serialization.XmlAttributeAttribute()]
    public string format {
        get {
            return this.formatField;
        }
        set {
            this.formatField = value;
        }
    }
    
    /// <remarks/>
    [System.Xml.Serialization.XmlAttributeAttribute()]
    public string headers {
        get {
            return this.headersField;
        }
        set {
            this.headersField = value;
        }
    }
}

/// <remarks/>
[System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
[System.SerializableAttribute()]
[System.Diagnostics.DebuggerStepThroughAttribute()]
[System.ComponentModel.DesignerCategoryAttribute("code")]
[System.Xml.Serialization.XmlTypeAttribute(AnonymousType=true)]
public partial class IndividualPolicyScheduleMainMemberMember {
    
    private string nameField;
    
    private System.DateTime dateOfBirthField;
    
    private string idNumberField;
    
    private decimal amountField;
    
    /// <remarks/>
    public string name {
        get {
            return this.nameField;
        }
        set {
            this.nameField = value;
        }
    }
    
    /// <remarks/>
    [System.Xml.Serialization.XmlElementAttribute(DataType="date")]
    public System.DateTime dateOfBirth {
        get {
            return this.dateOfBirthField;
        }
        set {
            this.dateOfBirthField = value;
        }
    }
    
    /// <remarks/>
    public string idNumber {
        get {
            return this.idNumberField;
        }
        set {
            this.idNumberField = value;
        }
    }
    
    /// <remarks/>
    public decimal amount {
        get {
            return this.amountField;
        }
        set {
            this.amountField = value;
        }
    }
}

/// <remarks/>
[System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
[System.SerializableAttribute()]
[System.Diagnostics.DebuggerStepThroughAttribute()]
[System.ComponentModel.DesignerCategoryAttribute("code")]
[System.Xml.Serialization.XmlTypeAttribute(AnonymousType=true)]
public partial class IndividualPolicyScheduleSpouse {
    
    private IndividualPolicyScheduleSpouseMember[] memberField;
    
    private string formatField;
    
    private string headersField;
    
    /// <remarks/>
    [System.Xml.Serialization.XmlElementAttribute("member")]
    public IndividualPolicyScheduleSpouseMember[] member {
        get {
            return this.memberField;
        }
        set {
            this.memberField = value;
        }
    }
    
    /// <remarks/>
    [System.Xml.Serialization.XmlAttributeAttribute()]
    public string format {
        get {
            return this.formatField;
        }
        set {
            this.formatField = value;
        }
    }
    
    /// <remarks/>
    [System.Xml.Serialization.XmlAttributeAttribute()]
    public string headers {
        get {
            return this.headersField;
        }
        set {
            this.headersField = value;
        }
    }
}

/// <remarks/>
[System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
[System.SerializableAttribute()]
[System.Diagnostics.DebuggerStepThroughAttribute()]
[System.ComponentModel.DesignerCategoryAttribute("code")]
[System.Xml.Serialization.XmlTypeAttribute(AnonymousType=true)]
public partial class IndividualPolicyScheduleSpouseMember {
    
    private string nameField;
    
    private System.DateTime dateOfBirthField;
    
    private string idNumberField;
    
    private decimal amountField;
    
    /// <remarks/>
    public string name {
        get {
            return this.nameField;
        }
        set {
            this.nameField = value;
        }
    }
    
    /// <remarks/>
    [System.Xml.Serialization.XmlElementAttribute(DataType="date")]
    public System.DateTime dateOfBirth {
        get {
            return this.dateOfBirthField;
        }
        set {
            this.dateOfBirthField = value;
        }
    }
    
    /// <remarks/>
    public string idNumber {
        get {
            return this.idNumberField;
        }
        set {
            this.idNumberField = value;
        }
    }
    
    /// <remarks/>
    public decimal amount {
        get {
            return this.amountField;
        }
        set {
            this.amountField = value;
        }
    }
}

/// <remarks/>
[System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
[System.SerializableAttribute()]
[System.Diagnostics.DebuggerStepThroughAttribute()]
[System.ComponentModel.DesignerCategoryAttribute("code")]
[System.Xml.Serialization.XmlTypeAttribute(AnonymousType=true)]
public partial class IndividualPolicyScheduleChildren {
    
    private IndividualPolicyScheduleChildrenMember[] memberField;
    
    private string formatField;
    
    private string headersField;
    
    /// <remarks/>
    [System.Xml.Serialization.XmlElementAttribute("member")]
    public IndividualPolicyScheduleChildrenMember[] member {
        get {
            return this.memberField;
        }
        set {
            this.memberField = value;
        }
    }
    
    /// <remarks/>
    [System.Xml.Serialization.XmlAttributeAttribute()]
    public string format {
        get {
            return this.formatField;
        }
        set {
            this.formatField = value;
        }
    }
    
    /// <remarks/>
    [System.Xml.Serialization.XmlAttributeAttribute()]
    public string headers {
        get {
            return this.headersField;
        }
        set {
            this.headersField = value;
        }
    }
}

/// <remarks/>
[System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
[System.SerializableAttribute()]
[System.Diagnostics.DebuggerStepThroughAttribute()]
[System.ComponentModel.DesignerCategoryAttribute("code")]
[System.Xml.Serialization.XmlTypeAttribute(AnonymousType=true)]
public partial class IndividualPolicyScheduleChildrenMember {
    
    private string nameField;
    
    private System.DateTime dateOfBirthField;
    
    private string idNumberField;
    
    private decimal amountField;
    
    /// <remarks/>
    public string name {
        get {
            return this.nameField;
        }
        set {
            this.nameField = value;
        }
    }
    
    /// <remarks/>
    [System.Xml.Serialization.XmlElementAttribute(DataType="date")]
    public System.DateTime dateOfBirth {
        get {
            return this.dateOfBirthField;
        }
        set {
            this.dateOfBirthField = value;
        }
    }
    
    /// <remarks/>
    public string idNumber {
        get {
            return this.idNumberField;
        }
        set {
            this.idNumberField = value;
        }
    }
    
    /// <remarks/>
    public decimal amount {
        get {
            return this.amountField;
        }
        set {
            this.amountField = value;
        }
    }
}

/// <remarks/>
[System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
[System.SerializableAttribute()]
[System.Diagnostics.DebuggerStepThroughAttribute()]
[System.ComponentModel.DesignerCategoryAttribute("code")]
[System.Xml.Serialization.XmlTypeAttribute(AnonymousType=true)]
public partial class IndividualPolicyScheduleExtendedFamily {
    
    private IndividualPolicyScheduleExtendedFamilyMember[] memberField;
    
    private string formatField;
    
    private string headersField;
    
    /// <remarks/>
    [System.Xml.Serialization.XmlElementAttribute("member")]
    public IndividualPolicyScheduleExtendedFamilyMember[] member {
        get {
            return this.memberField;
        }
        set {
            this.memberField = value;
        }
    }
    
    /// <remarks/>
    [System.Xml.Serialization.XmlAttributeAttribute()]
    public string format {
        get {
            return this.formatField;
        }
        set {
            this.formatField = value;
        }
    }
    
    /// <remarks/>
    [System.Xml.Serialization.XmlAttributeAttribute()]
    public string headers {
        get {
            return this.headersField;
        }
        set {
            this.headersField = value;
        }
    }
}

/// <remarks/>
[System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
[System.SerializableAttribute()]
[System.Diagnostics.DebuggerStepThroughAttribute()]
[System.ComponentModel.DesignerCategoryAttribute("code")]
[System.Xml.Serialization.XmlTypeAttribute(AnonymousType=true)]
public partial class IndividualPolicyScheduleExtendedFamilyMember {
    
    private string nameField;
    
    private System.DateTime dateOfBirthField;
    
    private string idNumberField;
    
    private decimal amountField;
    
    /// <remarks/>
    public string name {
        get {
            return this.nameField;
        }
        set {
            this.nameField = value;
        }
    }
    
    /// <remarks/>
    [System.Xml.Serialization.XmlElementAttribute(DataType="date")]
    public System.DateTime dateOfBirth {
        get {
            return this.dateOfBirthField;
        }
        set {
            this.dateOfBirthField = value;
        }
    }
    
    /// <remarks/>
    public string idNumber {
        get {
            return this.idNumberField;
        }
        set {
            this.idNumberField = value;
        }
    }
    
    /// <remarks/>
    public decimal amount {
        get {
            return this.amountField;
        }
        set {
            this.amountField = value;
        }
    }
}

/// <remarks/>
[System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
[System.SerializableAttribute()]
[System.Diagnostics.DebuggerStepThroughAttribute()]
[System.ComponentModel.DesignerCategoryAttribute("code")]
[System.Xml.Serialization.XmlTypeAttribute(AnonymousType=true)]
public partial class IndividualPolicyScheduleBeneficiaries {
    
    private IndividualPolicyScheduleBeneficiariesMember[] memberField;
    
    private string formatField;
    
    private string headersField;
    
    /// <remarks/>
    [System.Xml.Serialization.XmlElementAttribute("member")]
    public IndividualPolicyScheduleBeneficiariesMember[] member {
        get {
            return this.memberField;
        }
        set {
            this.memberField = value;
        }
    }
    
    /// <remarks/>
    [System.Xml.Serialization.XmlAttributeAttribute()]
    public string format {
        get {
            return this.formatField;
        }
        set {
            this.formatField = value;
        }
    }
    
    /// <remarks/>
    [System.Xml.Serialization.XmlAttributeAttribute()]
    public string headers {
        get {
            return this.headersField;
        }
        set {
            this.headersField = value;
        }
    }
}

/// <remarks/>
[System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
[System.SerializableAttribute()]
[System.Diagnostics.DebuggerStepThroughAttribute()]
[System.ComponentModel.DesignerCategoryAttribute("code")]
[System.Xml.Serialization.XmlTypeAttribute(AnonymousType=true)]
public partial class IndividualPolicyScheduleBeneficiariesMember {
    
    private string nameField;
    
    private System.DateTime dateOfBirthField;
    
    private string idNumberField;
    
    private string benefitField;
    
    private string relationshipField;
    
    /// <remarks/>
    public string name {
        get {
            return this.nameField;
        }
        set {
            this.nameField = value;
        }
    }
    
    /// <remarks/>
    [System.Xml.Serialization.XmlElementAttribute(DataType="date")]
    public System.DateTime dateOfBirth {
        get {
            return this.dateOfBirthField;
        }
        set {
            this.dateOfBirthField = value;
        }
    }
    
    /// <remarks/>
    public string idNumber {
        get {
            return this.idNumberField;
        }
        set {
            this.idNumberField = value;
        }
    }
    
    /// <remarks/>
    public string benefit {
        get {
            return this.benefitField;
        }
        set {
            this.benefitField = value;
        }
    }
    
    /// <remarks/>
    public string relationship {
        get {
            return this.relationshipField;
        }
        set {
            this.relationshipField = value;
        }
    }
}
