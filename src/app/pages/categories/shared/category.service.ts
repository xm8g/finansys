import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Category } from './category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private apiPath: string = 'api/categories';

  constructor(private httpClient: HttpClient) { }

  getAll(): Observable<Category[]> {
    return this.httpClient.get(this.apiPath).pipe(
      catchError(this.handleError),
      map(this.jsonToCategories)
    );
  }

  getById(id: number): Observable<Category> {
    return this.httpClient.get(`${this.apiPath}/${id}`).pipe(
      catchError(this.handleError),
      map(this.jsonToCategory)
    );
  }

  create(category: Category): Observable<Category> {
    return this.httpClient.post(this.apiPath, category).pipe(
      catchError(this.handleError),
      map(this.jsonToCategory)
    );
  }

  update(category: Category): Observable<Category> {
    const url = `${this.apiPath}/${category.id}`;

    return this.httpClient.put(url, category).pipe(
      catchError(this.handleError),
      map(() => category)
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

  private jsonToCategories(jsonData: any[]) : Category[] {
    let categories: Category[] = [];

    jsonData.forEach(element => categories.push(element as Category));
    return categories;
  }

  private jsonToCategory(jsonData: any) : Category {

    return jsonData as Category;
  }

}
