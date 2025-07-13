import { Component, Input, OnInit, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { CommutationExpenditure } from "../../../../models/commutation-expenditure.model";

@Component({
  selector: "app-expenditure",
  templateUrl: "./expenditure.component.html",
  styleUrls: ["./expenditure.component.css"],
})
export class ExpenditureComponent implements OnInit {
  @Input() isReadOnly = false;
  @Input() isWizard = false;
  @Input() itemList: CommutationExpenditure[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  isAddItem = false;
  dataSource: any;
  form: FormGroup;
  item: CommutationExpenditure;

  constructor(private _fb: FormBuilder) {}

  ngOnInit(): void {
    this.createForm();
    if (!this.itemList)
      this.itemList = []
    this.setDataSource();
  }

  createForm(): void {
    this.form = this._fb.group({
      itemName: new FormControl(null, { validators: Validators.required }),
      itemValue: new FormControl(null, {
        validators: Validators.required,
      }),
    });
  }

  addMode() {
    this.isAddItem = !this.isAddItem;
  }

  addItem() {
    if (this.form.valid) {
      const item: CommutationExpenditure = {
        item: this.form.value.itemName,
        amount: this.form.value.itemValue,
        commutationId: 0
      }

      this.itemList.push(item);
      this.setDataSource();
      this.addMode();
      this.form.reset();
    }

  }

  setDataSource () {
    this.dataSource = new MatTableDataSource(this.itemList);
    this.dataSource.paginator = this.paginator;
  }

  pageMetaData = {
    displayColumns: ["item", "amount"],
    columnsDef: {
      item: {
        displayName: "Item",
        type: "text",
        sortable: true,
      },
      amount: {
        displayName: "Amount",
        type: "currency",
        sortable: true,
      },
    },
  };
}
