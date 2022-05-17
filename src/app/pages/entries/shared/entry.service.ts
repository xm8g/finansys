import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Entry } from './entry';

@Injectable({
  providedIn: 'root'
})
export class EntryService {

  private apiPath: string = 'api/entries';

  constructor(private httpClient: HttpClient) { }

  getAll(): Observable<Entry[]> {
    return this.httpClient.get(this.apiPath).pipe(
      catchError(this.handleError),
      map(this.jsonToEntries)
    );
  }

  getById(id: number): Observable<Entry> {
    return this.httpClient.get(`${this.apiPath}/${id}`).pipe(
      catchError(this.handleError),
      map(this.jsonToEntry)
    );
  }

  create(entry: Entry): Observable<Entry> {
    return this.httpClient.post(this.apiPath, entry).pipe(
      catchError(this.handleError),
      map(this.jsonToEntry)
    );
  }

  update(entry: Entry): Observable<Entry> {
    const url = `${this.apiPath}/${entry.id}`;

    return this.httpClient.put(url, entry).pipe(
      catchError(this.handleError),
      map(() => entry)
    );
  }

  delete(id: number): Observable<any> {
    const url = `${this.apiPath}/${id}`;

    return this.httpClient.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
    );
  }


  private handleError(error: any) : Observable<any> {
    console.log("Erro na requisição -> ", error);
    return throwError(() => new Error(error))
  }

  private jsonToEntries(jsonData: any[]) : Entry[] {
    let entries: Entry[] = [];

    jsonData.forEach(element => entries.push(Object.assign(new Entry(), element)));
    return entries;
  }

  private jsonToEntry(jsonData: any) : Entry {
    return Object.assign(new Entry(), jsonData)
  }
}
