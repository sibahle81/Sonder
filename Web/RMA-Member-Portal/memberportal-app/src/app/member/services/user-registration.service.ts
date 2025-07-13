import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from 'src/app/core/models/security/user.model';
import { CommonService } from 'src/app/core/services/common/common.service';
import { ConstantApi } from 'src/app/shared/constants/constant';
import { DocumentsRequest } from 'src/app/shared/models/documents-request.model';
import { UserRegistrationDetails } from 'src/app/shared/models/user-registration-details';
import { Document } from '../../shared/models/document.model';
import { Compcare_User } from './../../core/models/security/compcare-user-model';

@Injectable()
export class UserRegistrationService {

    constructor(private readonly commonService: CommonService) {
    }

    getUserDetailsById(idNumber: string): Observable<UserRegistrationDetails> {
        return this.commonService.get<UserRegistrationDetails>(idNumber, `${ConstantApi.UserRegistration}/GetUserDetailsByIdNumber`);
    }

    registerUserDetails(userRegistrationDetails: UserRegistrationDetails): Observable<boolean> {
        return this.commonService.addReturnsBoolean(userRegistrationDetails, `${ConstantApi.UserRegistration}/RegisterUserDetails`);
    }

    GetDocumentsBySetAndKey(documentRequest: DocumentsRequest): Observable<Document[]> {
        return this.commonService.GetDocumentsBySetAndKey<DocumentsRequest, Document[]>
            (`${ConstantApi.UserRegistration}/GetDocumentsBySetAndKey`, documentRequest);
    }

    GetDocumentBinary(docId: number): Observable<Document> {
        return this.commonService.get<Document>(docId, `${ConstantApi.UserRegistration}/GetDocumentBinary`);
    }

    UpdateDocument(documents: Document): Observable<boolean> {
        return this.commonService.edit<Document>(documents, `${ConstantApi.UserRegistration}/UpdateDocument`);
    }

    UploadDocument(document: Document): Observable<Document> {
        return this.commonService.UploadDocument<Document>(document, `${ConstantApi.UserRegistration}/SaveUpload`);
    }

    getUserDetailsByActivateId(activateId: string): Observable<UserRegistrationDetails> {
        return this.commonService.get<UserRegistrationDetails>(activateId, `${ConstantApi.UserRegistration}/GetMemberDetailsByActivateId`);
    }

    createUser(userRegistrationDetails: UserRegistrationDetails): Observable<string> {
        return this.commonService.add(userRegistrationDetails, `${ConstantApi.UserRegistration}/CreateUser`);
    }

    onDocumentUpload(userRegistrationDetails: UserRegistrationDetails): Observable<boolean> {
        return this.commonService.addReturnsBoolean(userRegistrationDetails, `${ConstantApi.UserRegistration}/OnDocumentUpload`);
    }

    getUserDetailsByEmail(email: string): Observable<UserRegistrationDetails> {
        return this.commonService.get<UserRegistrationDetails>(email, `${ConstantApi.UserRegistration}/GetUserDetailsByEmail`);
    }

    resendUserActivation(activateId: string): Observable<boolean> {
        return this.commonService.getAll<boolean>(`${ConstantApi.UserRegistration}/ResendUserActivation/${activateId}`);
    }

    sendPasswordResetLink(email: string): Observable<boolean> {
        return this.commonService.getAll<boolean>(`${ConstantApi.UserRegistration}/SendMemberPasswordResetLink/${email}`);
    }

    UpdateUser(userRegistrationDetails: UserRegistrationDetails): Observable<number> {
        return this.commonService.add(userRegistrationDetails, `${ConstantApi.UserRegistration}/UpdateUser`);
    }

    checkIfBrokerageExists(fspNumber: string): Observable<number> {
        return this.commonService.getAll(`${ConstantApi.UserRegistration}/checkIfBrokerageExists/${fspNumber}`);
    }

    getUserDetailsVopdResponse(idnumber: string): Observable<string> {
        return this.commonService.getString(`${ConstantApi.UserRegistration}/GetUserDetailsVopdResponse/${idnumber}`);
    }

    checkIfWizardHasBeenCreated(type: string, data: string): Observable<boolean> {
        return this.commonService.getBoolean(`${ConstantApi.UserRegistration}/CheckIfWizardHasBeenCreated/${type}/${data}`);
    }

    getMatchingCompcareUsersByEmailAddress(email: string): Observable<Compcare_User[]> {
        return this.commonService.getAll<Compcare_User[]>(`${ConstantApi.UserRegistration}/GetCompcareUsersByEmailAddress/${email}`);
    }

    getUserByUserDetailId(userDetailId: number): Observable<UserRegistrationDetails> {
        return this.commonService.get<UserRegistrationDetails>(userDetailId, `${ConstantApi.UserRegistration}/GetUserByUserDetailId/${userDetailId}`);
    }

    getUser(id: number): Observable<User> {
        return this.commonService.get<User>(id, `${ConstantApi.UserRegistration}`);
    }
}
