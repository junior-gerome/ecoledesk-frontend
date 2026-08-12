import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AnneeScolaireService } from './annee-scolaire.service';

describe('AnneeScolaireService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AnneeScolaireService],
    });
  });

  it('should create', () => {
    const service = TestBed.inject(AnneeScolaireService);
    expect(service).toBeTruthy();
  });
});
