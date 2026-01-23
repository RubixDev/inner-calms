import { Component, inject, input, signal } from '@angular/core'
import {
  FormBuilder,
  FormGroup,
  FormRecord,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
import { ShipLogFactSave } from '../../model/save-file.model'
import { WithFormControls } from '../../util'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { ShipLogFactEditorComponent } from '../ship-log-fact-editor/ship-log-fact-editor.component'
import { MatExpansionModule } from '@angular/material/expansion'
import { AsyncPipe } from '@angular/common'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { combineLatest, distinctUntilChanged, map, startWith, switchMap } from 'rxjs'
import { toObservable } from '@angular/core/rxjs-interop'
import { ShipLogFacts } from '../../model/ship-log.model'

@Component({
  selector: 'app-ship-log-editor',
  imports: [
    AsyncPipe,
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    ShipLogFactEditorComponent,
  ],
  templateUrl: './ship-log-editor.component.html',
  styleUrl: './ship-log-editor.component.scss',
  standalone: true,
})
export class ShipLogEditorComponent {
  private readonly fb = inject(FormBuilder)

  readonly form = input.required<FormRecord<FormGroup<WithFormControls<ShipLogFactSave>>>>()

  protected readonly newFact = signal('')

  private readonly currentFactIDs$ = toObservable(this.form).pipe(
    switchMap(form =>
      form.valueChanges.pipe(
        startWith(form.value),
        map(v => Object.keys(v)),
        distinctUntilChanged(),
      ),
    ),
  )
  protected readonly filteredFacts$ = combineLatest([
    toObservable(this.newFact),
    this.currentFactIDs$,
  ]).pipe(
    map(([newFact, ids]) =>
      // suggest matching known ship log fact ids that don't have controls yet
      Object.keys(ShipLogFacts).filter(
        key => key.toLowerCase().includes(newFact.toLowerCase()) && !ids.includes(key),
      ),
    ),
  )
  protected readonly addFactDisabled$ = combineLatest([
    toObservable(this.newFact),
    this.currentFactIDs$,
  ]).pipe(map(([newFact, ids]) => newFact === '' || ids.includes(newFact)))

  protected getFormGroup(key: string): FormGroup<WithFormControls<ShipLogFactSave>> {
    return this.form().get(key) as FormGroup<WithFormControls<ShipLogFactSave>>
  }

  protected addFact() {
    this.form().addControl(
      this.newFact(),
      this.fb.nonNullable.group({
        id: [this.newFact(), Validators.required],
        revealOrder: [
          Object.values(this.form().value).reduce(
            (max, fact) => Math.max(max, fact?.revealOrder ?? -1),
            -1,
          ) + 1,
          Validators.required,
        ],
        newlyRevealed: [false, Validators.required],
        read: [false, Validators.required],
      }),
    )
    this.newFact.set('')
  }

  protected readonly Object = Object
}
