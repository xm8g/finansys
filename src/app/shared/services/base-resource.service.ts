import { HttpClient } from '@angular/common/http';
import { Injector } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { BaseResourceModel } from '../models/base-resource.model';

export abstract class BaseResourceService<T extends BaseResourceModel> {

  protected httpClient: HttpClient;

  constructor(
    protected apiPath: string,
    protected injector: Injector,
    protected jsonDataToResourceFn: (jsonData: any) => T) {

    this.httpClient = injector.get(HttpClient);
  }

  getAll(): Observable<T[]> {
    return this.httpClient.get(this.apiPath).pipe(
      catchError(this.handleError),
      map(this.jsonToResources.bind(this)),
    );
  }

  getById(id: number | undefined): Observable<T> {
    return this.httpClient.get(`${this.apiPath}/${id}`).pipe(
      map(this.jsonToResource.bind(this)),
      catchError(this.handleError),
    );
  }

  create(resource: T): Observable<T> {
    return this.httpClient.post(this.apiPath, resource).pipe(
      map(this.jsonToResource.bind(this)),
      catchError(this.handleError),
    );
  }

  update(resource: T): Observable<T> {
    const url = `${this.apiPath}/${resource.id}`;

    return this.httpClient.put(url, resource).pipe(
      map(() => resource),
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<any> {
    const url = `${this.apiPath}/${id}`;

    return this.httpClient.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
    );
  }

  protected handleError(error: any) : Observable<any> {
    console.log("Erro na requisição -> ", error);
    return throwError(() => new Error(error))
  }

  protected jsonToResources(jsonData: Array<any>) : T[] {
    let resources: T[] = [];

    jsonData.forEach(element => resources.push(this.jsonDataToResourceFn(element)));
    return resources;
  }

  protected jsonToResource(jsonData: any) : T {

    return this.jsonDataToResourceFn(jsonData);
  }
}
