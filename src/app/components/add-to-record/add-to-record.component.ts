import { AsyncPipe } from '@angular/common'
import { Component, input, output, signal } from '@angular/core'
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
  ],
  templateUrl: './add-to-record.component.html',
  styleUrl: './add-to-record.component.scss',
  standalone: true,
})
export class AddToRecordComponent {
  readonly label = input.required<string>()
  readonly form = input.required<FormRecord>()
  readonly suggestions = input<string[]>([])
  readonly add = output<string>()

  protected readonly value = signal('')

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
    toObservable(this.value),
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
    toObservable(this.value),
    this.currentKeys$,
  ]).pipe(map(([value, currentKeys]) => value === '' || currentKeys.includes(value)))

  protected emitAdd() {
    this.add.emit(this.value())
    this.value.set('')
  }
}
