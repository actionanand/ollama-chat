import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatComponent } from './chat.component';
import { OllamaService } from '../../services/ollama.service';
import { of } from 'rxjs';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let ollamaService: jasmine.SpyObj<OllamaService>;

  beforeEach(async () => {
    const ollamaServiceSpy = jasmine.createSpyObj('OllamaService', ['sendMessage', 'streamMessage']);

    await TestBed.configureTestingModule({
      declarations: [ChatComponent],
      providers: [{ provide: OllamaService, useValue: ollamaServiceSpy }],
    }).compileComponents();

    ollamaService = TestBed.inject(OllamaService) as jasmine.SpyObj<OllamaService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should send a message', () => {
    const model = 'test-model';
    const messages = [{ content: 'Hello' }];
    ollamaService.sendMessage.and.returnValue(of({ response: 'Hello' }));

    component.sendMessage(model, messages);

    expect(ollamaService.sendMessage).toHaveBeenCalledWith(model, messages);
  });

  it('should handle streamed messages', () => {
    const model = 'test-model';
    const messages = [{ content: 'Hello' }];
    const mockResponse = { message: { content: 'Hello from stream' } };
    ollamaService.streamMessage.and.returnValue(of(mockResponse.message.content));

    component.streamMessages(model, messages);

    expect(ollamaService.streamMessage).toHaveBeenCalledWith(model, messages);
  });
});
