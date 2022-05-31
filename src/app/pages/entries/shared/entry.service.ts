import { Injectable, Injector } from '@angular/core';
import { mergeMap, Observable, catchError, map } from 'rxjs';
import { BaseResourceService } from '../../../shared/services/base-resource.service';
import { CategoryService } from '../../categories/shared/category.service';
import { Entry } from './entry';

import * as moment from 'moment';

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

  getByMonthAndYear(month: number, year: number): Observable<Entry[]> {
    return this.getAll().pipe(
      map(entries => this.filterByMonthAndYear(month, year, entries))
    )
  }

  private filterByMonthAndYear(month: number, year: number, entries: Entry[]): any {
    return entries.filter(entry => {
      const entryDate = moment(entry.date, "dd/MM/yyyy");
      const monthMatches = entryDate.month() + 1 == month;
      const yearMatches = entryDate.year() == year;

      return monthMatches && yearMatches
    });
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
