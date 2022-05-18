import { Injectable, Injector } from '@angular/core';
import { mergeMap, Observable } from 'rxjs';
import { BaseResourceService } from '../../../shared/services/base-resource.service';
import { CategoryService } from '../../categories/shared/category.service';
import { Entry } from './entry';

@Injectable({
  providedIn: 'root'
})
export class EntryService extends BaseResourceService<Entry> {


  constructor(
    protected override injector: Injector,
    private categoryService: CategoryService) {

    super('api/entries', injector, Entry.fromJson);
  }

  override create(entry: Entry): Observable<Entry> {

    return this.categoryService.getById(entry.categoryId).pipe(
      mergeMap(category => {
        entry.category = category;
        return super.create(entry)
      })
    )
  }

  override update(entry: Entry): Observable<Entry> {

    return this.categoryService.getById(entry.categoryId).pipe(
      mergeMap(category => {
        entry.category = category;
        return super.update(entry);
      })
    );
  }

}
