import { Component, OnInit, Inject } from '@angular/core';
import { ClientService } from '../../services/client.service';
import { MatTableDataSource, MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { Client } from '../../models/client';
import { FormDialogComponent } from '../form-dialog/form-dialog.component';
import 'rxjs/add/operator/mergeMap';
@Component({
  selector: 'app-client-listing',
  templateUrl: './client-listing.component.html',
  styleUrls: ['./client-listing.component.scss']
})
export class ClientListingComponent implements OnInit {
  displayedColumns = ['firstName', 'lastName', 'email', 'action'];
  dataSource = new MatTableDataSource<Client>();
  isResultsLoading = false
  constructor(private clientService: ClientService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.isResultsLoading = true;
    this.clientService.getClients()
      .subscribe(data => {
        console.log(data)
        this.dataSource.data = data;
      }, err => console.error(err),
        () => this.isResultsLoading = false);
  }
  saveBtnHanlder() {

  }

  deleteBtnHandler(clientId) {
    console.log(clientId)
  }
  openDialog(clientId: string): void {
    const options = {
      width: '400px',
      height: '300px',
      data: {}
    }
    if (clientId) {
      options.data = { clientId: clientId }
    }
    let dialogRef = this.dialog.open(FormDialogComponent, options);
    dialogRef.afterClosed()
      .filter(clientParam => typeof clientParam === 'object')
      .flatMap(result => {
        //if clientId
        debugger;
        if (clientId) {
          return this.clientService.updateClient(clientId, result)
        }
        else {
          return this.clientService.createClient(result)
        }
      })
      .subscribe(client => {
        debugger;
        let successMsg = '';
        if (clientId) {
          const index = this.dataSource.data.findIndex(client => client._id === clientId);
          this.dataSource.data[index] = client;
          successMsg = 'Client updated'
        }
        else {
          this.dataSource.data.push(client);
          successMsg = 'Client created'
        }
        this.dataSource.data = [...this.dataSource.data];
        this.snackBar.open(successMsg, 'Success', {
          duration: 2000
        })
      }, err => this.errorHandler(err, 'Failed to created Client'))
  }
  private errorHandler(error, message) {
    console.error(error);
    this.snackBar.open(message, 'Error', {
      duration: 2000
    });
  }

}
