import { Component, OnInit } from '@angular/core';
import { Entry } from '../shared/entry';
import { EntryService } from '../shared/entry.service';
import { BaseResourceListComponent } from '../../../shared/components/base-resource-list/base-resource-list.component';

@Component({
  selector: 'app-entry-list',
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.css']
})
export class EntryListComponent extends BaseResourceListComponent<Entry> {

  get entries() {
    return this.resources;
  }

  constructor(private entryService: EntryService) {
    super(entryService);
  }
  

}
