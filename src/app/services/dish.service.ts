import { Injectable } from '@angular/core';
import { Dish } from '../shared/dish';
import { DISHES } from '../shared/dishes';
import { of, Observable, observable } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { baseURL } from '../shared/baseurl';
import { ProcessHttpmsgService } from './process-httpmsg.service';

@Injectable({
  providedIn: 'root'
})
export class DishService {

  constructor(private http: HttpClient,
    private processHTTPMsgService: ProcessHttpmsgService) { }

  getDishes(): Observable<Dish[]> {
    // using topromise operator with observable
    // return of(DISHES).pipe(delay(2000)).toPromise();

    // return new Promise(resolve => {
    //   // Simulate server latency with 2 second delay
    //   setTimeout(() => resolve(DISHES), 2000);
    // });
    // using rxjs
    // return of(DISHES).pipe(delay(2000));
    // using http client
    return this.http.get<Dish[]>(baseURL + 'dishes').pipe(catchError(this.processHTTPMsgService.handleError));
  }
  getDish(id: string): Observable<Dish> {
    // return new Promise(resolve => {
    //   // Simulate server latency with 2 second delay
    //   setTimeout(() => resolve(DISHES.filter((dish) => (dish.id === id))[0]), 2000);
    // });
    // using rxjs
    // return of(DISHES.filter((dish) => (dish.id === id))[0]).pipe(delay(2000));
    // using http client
    return this.http.get<Dish>(baseURL + 'dishes/' + id).pipe(catchError(this.processHTTPMsgService.handleError));
  }

  getFeaturedDish(): Observable<Dish> {
    // return new Promise(resolve => {
    //   // Simulate server latency with 2 second delay
    //   setTimeout(() => resolve(DISHES.filter((dish) => dish.featured)[0]), 2000);
    // });
    // using rxjs
    // return of(DISHES.filter((dish) => dish.featured)[0]).pipe(delay(2000));
    // using http client
    return this.http.get<Dish[]>(baseURL + 'dishes?featured=true').pipe(map(dishes => dishes[0]))
      .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  getDishIds(): Observable<string[] | any> {
    // using rxjs
    // return of(DISHES.map(dish => dish.id));
    // usning http client
    return this.getDishes().pipe(map(dishes => dishes.map(dish => dish.id))).pipe(catchError(error => error));
  }

  putDish(dish: Dish): Observable<Dish> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.put<Dish>(baseURL + 'dishes/' + dish.id, dish, httpOptions)
      .pipe(catchError(this.processHTTPMsgService.handleError));

  }
}
