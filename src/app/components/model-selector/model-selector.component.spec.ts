import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModelSelectorComponent } from './model-selector.component';
import { OllamaService } from '../../services/ollama.service';
import { of } from 'rxjs';

describe('ModelSelectorComponent', () => {
  let component: ModelSelectorComponent;
  let fixture: ComponentFixture<ModelSelectorComponent>;
  let ollamaService: jasmine.SpyObj<OllamaService>;

  beforeEach(async () => {
    const ollamaServiceSpy = jasmine.createSpyObj('OllamaService', ['getModels']);

    await TestBed.configureTestingModule({
      declarations: [ModelSelectorComponent],
      providers: [{ provide: OllamaService, useValue: ollamaServiceSpy }],
    }).compileComponents();

    ollamaService = TestBed.inject(OllamaService) as jasmine.SpyObj<OllamaService>;
    fixture = TestBed.createComponent(ModelSelectorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch models on init', () => {
    const mockModels = [{ name: 'Model 1' }, { name: 'Model 2' }];
    ollamaService.getModels.and.returnValue(of(mockModels));

    component.ngOnInit();

    expect(ollamaService.getModels).toHaveBeenCalled();
    expect(component.models).toEqual(mockModels);
  });
});
