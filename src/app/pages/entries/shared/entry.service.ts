import { Injectable, Injector } from '@angular/core';
import { mergeMap, Observable, catchError } from 'rxjs';
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
    return this.fillEntryWithCategoryAndSend(entry, super.create.bind(this));
  }

  override update(entry: Entry): Observable<Entry> {
    return this.fillEntryWithCategoryAndSend(entry, super.update.bind(this));
  }

  private fillEntryWithCategoryAndSend(entry: Entry, sendFn: (entry: Entry) => Observable<Entry>): Observable<Entry> {
    return this.categoryService.getById(entry.categoryId).pipe(
      mergeMap(category => {
        entry.category = category;
        return sendFn(entry);
      }),
      catchError(this.handleError)
    );
  }

}
