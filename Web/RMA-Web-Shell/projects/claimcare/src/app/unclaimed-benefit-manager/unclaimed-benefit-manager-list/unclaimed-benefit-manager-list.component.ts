import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { UnclaimedBenefitManagerService } from '../unclaimed-benefit-manager.service';
import { Subscription } from 'rxjs';
import { UnclaimedBenefitInterest } from '../../claim-manager/shared/entities/unclaimedBenefit/unclaimedBenefitInterest';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UploadControlComponent } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.component';

@Component({
  selector: 'app-unclaimed-benefit-manager-list',
  templateUrl: './unclaimed-benefit-manager-list.component.html',
  styleUrls: ['./unclaimed-benefit-manager-list.component.css']
})
export class UnclaimedBenefitManagerListComponent implements OnInit, AfterViewInit, OnDestroy {
  public displayedColumns = [
    'startDate',
    'endDate',
    'naca',
    'investmentPeriod',
    'incrementalRate',
    'cumulativeRate',
    'details',
    'delete'
  ];

  public allowedDocumentTypes: string;
  public dataSource = new MatTableDataSource<UnclaimedBenefitInterest>();
  public documentType: DocumentType;
  public isUploading: boolean;
  public keys: { [key: string]: string };
  
  @ViewChild(MatPaginator, { static: true }) public paginator: MatPaginator;
  @ViewChild('bankInterestDocument', { static: true }) public bankInterestDocument: UploadControlComponent;
  @ViewChild(MatSort, { static: true }) public sort: MatSort;

  private getAllUnclaimedBenefitSubscriber: Subscription;

  constructor(private unclaimedBenefitManagerService: UnclaimedBenefitManagerService,
    private alertService: AlertService) { }
 
  public ngOnInit(): void {
    //  this.documentType = new DocumentType();
    this.GetAllUnclaimendBenefitInterests();
  }

  public ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  public ngOnDestroy(): void {
    if (this.getAllUnclaimedBenefitSubscriber) {
      this.getAllUnclaimedBenefitSubscriber.unsubscribe();
    }
  }

  public redirectToDetails = (id: string) => {
    
  }
 
  public redirectToUpdate = (id: string) => {
    
  }
 
  public redirectToDelete = (id: string) => {
    
  }

  public doFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }

  public UploadDocuments( ){
    
  }

  private GetAllUnclaimendBenefitInterests(): void {
    this.getAllUnclaimedBenefitSubscriber =
      this.unclaimedBenefitManagerService
        .GetAllUnclaimendBenefitInterests()
        .subscribe((data: UnclaimedBenefitInterest[]) => {
          this.dataSource.data = data;
        },
          (error) => {
            this.alertService.error(error)
          });
  }
}
