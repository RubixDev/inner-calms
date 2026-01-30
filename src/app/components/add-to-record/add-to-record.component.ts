import { AsyncPipe, NgTemplateOutlet } from '@angular/common'
import {
  Component,
  computed,
  contentChild,
  input,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core'
import { toObservable } from '@angular/core/rxjs-interop'
import { FormRecord, FormsModule } from '@angular/forms'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { combineLatest, distinctUntilChanged, map, startWith, switchMap } from 'rxjs'

@Component({
  selector: 'app-add-to-record',
  imports: [
    AsyncPipe,
    FormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    NgTemplateOutlet,
  ],
  templateUrl: './add-to-record.component.html',
  styleUrl: './add-to-record.component.scss',
  standalone: true,
})
export class AddToRecordComponent {
  readonly label = input.required<string>()
  readonly form = input.required<FormRecord>()
  readonly suggestions = input<string[]>([])
  readonly type = input('text')
  readonly validate = input<(value: string) => boolean>(() => true)
  readonly add = output<string>()

  private readonly passedTemplate = contentChild(TemplateRef)
  private readonly defaultTemplate = viewChild.required(TemplateRef)
  protected readonly optionTemplate = computed(
    () => this.passedTemplate() ?? this.defaultTemplate(),
  )

  protected readonly value = signal('')
  private readonly stringValue = computed(() => this.value() + '')

  private readonly currentKeys$ = toObservable(this.form).pipe(
    switchMap(form =>
      form.valueChanges.pipe(
        startWith(form.value),
        map(v => Object.keys(v)),
        distinctUntilChanged(),
      ),
    ),
  )

  protected readonly filteredSuggestions$ = combineLatest([
    toObservable(this.stringValue),
    toObservable(this.suggestions),
    this.currentKeys$,
  ]).pipe(
    map(([value, suggestions, currentKeys]) =>
      // suggest matching suggestions that don't have controls yet
      suggestions.filter(
        key => key.toLowerCase().includes(value.toLowerCase()) && !currentKeys.includes(key),
      ),
    ),
  )

  protected readonly addDisabled$ = combineLatest([
    toObservable(this.stringValue),
    this.currentKeys$,
    toObservable(this.validate),
  ]).pipe(
    map(
      ([value, currentKeys, validate]) =>
        !validate(value) || value === '' || currentKeys.includes(value),
    ),
  )

  protected emitAdd() {
    this.add.emit(this.value())
    this.value.set('')
  }
}
