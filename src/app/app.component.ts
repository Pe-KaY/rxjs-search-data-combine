import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { fromEvent, of, combineLatest } from 'rxjs';
import { debounceTime, switchMap, filter, map, catchError, startWith, delay, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'rxjs-search-observable';


  resultSearch: string | null = null;
  loadingSearch: boolean = false;
  errorSearch: string = '';

  combinedData: any = null;
  loadingData: boolean = true;
  errorData: string = '';

  ngOnInit() {

    //  Debounced Search:
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;
    const search$ = fromEvent(searchInput, 'input').pipe(
      map(event => (event.target as HTMLInputElement).value),
      debounceTime(300),
      filter(term => term.length >= 3 || term.length === 0),
      tap(term => {
        this.loadingSearch = term.length >= 3;
        this.errorSearch = '';
      }),
      switchMap(term => term.length >= 3 ? of(this.getRandomFruit()) : of(null)),
      catchError(_err => {
        this.errorSearch = 'Search API failed';
        return of(null);
      })
    );

    search$.subscribe(result => {
      this.loadingSearch = false;
      this.resultSearch = result !== null ? result : 'Error: less than 3 characters';
    });

    // Combine Data from Multiple Endpoints
    const userDetails$ = of({ name: 'Alice', email: 'alice@example.com' }).pipe(delay(1000));
    const userPosts$ = of([
      { title: 'Post 1: "Kenkey Party at the office this Friday"' },
      { title: 'Post 2: "Lifting weights in the evening feels good "' }
    ]).pipe(delay(1500));

    combineLatest([userDetails$, userPosts$]).pipe(
      map(([user, posts]) => ({ user, posts })),
      catchError(_err => {
        this.errorData = 'Error fetching data';
        return of({ user: null, posts: [] });
      })
    ).subscribe(data => {
      this.loadingData = false;
      if (data.user && data.posts) {
        this.combinedData = data;
      } else {
        this.errorData = 'No data available';
      }
    });
  }

  // Function to get a random fruit
  getRandomFruit(): string {
    const fruits = ['Apple', 'Banana', 'Cherry', 'Date', 'Fig', 'Grape', 'Kiwi', 'Mango', 'Orange', 'Papaya'];
    const randomIndex = Math.floor(Math.random() * fruits.length);
    return fruits[randomIndex];
  }
}
