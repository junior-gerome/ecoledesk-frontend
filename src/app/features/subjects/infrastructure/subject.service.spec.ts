import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SubjectService } from './subject.service';

describe('SubjectService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SubjectService],
    });
  });

  it('should create', () => {
    const service = TestBed.inject(SubjectService);
    expect(service).toBeTruthy();
  });
});
