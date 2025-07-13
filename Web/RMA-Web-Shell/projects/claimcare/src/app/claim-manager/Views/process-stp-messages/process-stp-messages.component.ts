import { ServiceBusMessage } from 'projects/shared-models-lib/src/lib/common/service-bus-message';
import { ServiceBusMessageService } from 'projects/shared-services-lib/src/lib/services/service-bus-message/service-bus-message-service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { Router } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AccidentService } from '../../Services/accident.service';

@Component({
  selector: 'app-process-stp-messages',
  templateUrl: './process-stp-messages.component.html',
  styleUrls: ['./process-stp-messages.component.css']
})
export class ProcessStpMessagesComponent implements OnInit {
  displayedColumns = ['from', 'to', 'environment', 'enqueuedTime','messageProcessedTime', 'actions'];
  public dataSource = new MatTableDataSource<ServiceBusMessage>();
  index: number;
  id: number;
  isProcessing = false;
  processMessage: string;
  serviceBusMessages: ServiceBusMessage[];
  isLoadingSTPMessages$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  constructor(public commonService: CommonService,
              private readonly confirmservice: ConfirmationDialogsService,
              private readonly router: Router,
              private readonly alertService: AlertService,
              private readonly accidentService: AccidentService,
              private readonly serviceBusMessageService: ServiceBusMessageService) {}

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;

  ngOnInit() {
    this.getServiceBusMessages();
  }

  refresh() {
    this.getServiceBusMessages();
    if(this.dataSource.data.length > 1)
      this.paginator._changePageSize(this.paginator.pageSize);
  }

  processSTP(serviceBusMessage: ServiceBusMessage): void {
    this.isProcessing = true;
    this.processMessage = 'STP Message processing...';
    this.accidentService.rerunSTPIntegrationMessage(serviceBusMessage.serviceBusMessageId).subscribe(results=>{
        this.refresh();
        this.done('Message processed successfully');
    })
  }

  done(statusMesssage: string) {
    this.alertService.success(statusMesssage, 'Success', true);
    this.isProcessing = false;
    this.getServiceBusMessages();
  }

  clear() {
    this.router.navigate(['claimcare/claim-manager']);
  }

  searchData(data) {
    this.applyFilter(data);
  }

  applyFilter(filterValue: any) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if(this.dataSource.data.length > 0){
      this.dataSource.paginator.firstPage();
    }
  }

  getServiceBusMessages() {
    this.isLoadingSTPMessages$.next(true);
    this.serviceBusMessageService.getUnProcessedSTPMessages().subscribe(messages => {
      this.dataSource.data = messages;
      this.serviceBusMessages = messages;
      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
      this.isLoadingSTPMessages$.next(false);
    });
  }
}
