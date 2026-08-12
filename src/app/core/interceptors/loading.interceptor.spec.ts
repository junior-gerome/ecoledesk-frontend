import { HttpEvent, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { LoadingService } from '@app/core/services/loading.service';
import { loadingInterceptor } from './loading.interceptor';
import { Observable, of, throwError } from 'rxjs';

describe('loadingInterceptor', () => {
  let loading: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [LoadingService] });
    loading = TestBed.inject(LoadingService);
    loading.reset();
  });

  it('starts and stops loading around a successful request', () => {
    const request = new HttpRequest('GET', '/students');
    let duringRequest = false;
    TestBed.runInInjectionContext(() => loadingInterceptor(request, () => {
      duringRequest = loading.isLoading();
      return of(new HttpResponse({ status: 200 }));
    })).subscribe();
    expect(duringRequest).toBeTrue();
    expect(loading.isLoading()).toBeFalse();
  });

  it('stops loading when a request fails', () => {
    const request = new HttpRequest('GET', '/students');
    TestBed.runInInjectionContext(() => loadingInterceptor(request, () =>
      throwError(() => new Error('network')))).subscribe({ error: () => undefined });
    expect(loading.isLoading()).toBeFalse();
  });


  it('keeps loading active while another request remains pending', () => {
    const request = new HttpRequest('GET', '/students');
    let releaseA!: () => void;
    let releaseB!: () => void;
    const pendingA = new Observable<HttpEvent<unknown>>((subscriber) => {
      releaseA = () => { subscriber.next(new HttpResponse({ status: 200 })); subscriber.complete(); };
    });
    const pendingB = new Observable<HttpEvent<unknown>>((subscriber) => {
      releaseB = () => { subscriber.next(new HttpResponse({ status: 200 })); subscriber.complete(); };
    });
    TestBed.runInInjectionContext(() => loadingInterceptor(request, () => pendingA)).subscribe();
    TestBed.runInInjectionContext(() => loadingInterceptor(request, () => pendingB)).subscribe();
    releaseA();
    expect(loading.isLoading()).toBeTrue();
    releaseB();
    expect(loading.isLoading()).toBeFalse();
  });
 
  it('does not count requests marked X-Silent', () => {
    const request = new HttpRequest('GET', '/health', null, { headers: new HttpHeaders({ 'X-Silent': 'true' }) });
    TestBed.runInInjectionContext(() => loadingInterceptor(request, () => of(new HttpResponse({ status: 200 })))).subscribe();
    expect(loading.isLoading()).toBeFalse();
  });
});




