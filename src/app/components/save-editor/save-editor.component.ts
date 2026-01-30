import { Component, inject } from '@angular/core'
import {
  DeathType,
  SaveFile,
  SaveFileJson,
  ShipLogFactSave,
  SignalName,
  StartupPopups,
} from '../../model/save-file.model'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormRecord,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatExpansionModule } from '@angular/material/expansion'
import { saveAs } from 'file-saver'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { ShipLogFacts } from '../../model/ship-log.model'
import { combineLatestWith, distinctUntilChanged, filter, map, pairwise, startWith } from 'rxjs'
import { AsyncPipe } from '@angular/common'
import { KnownConditions } from '../../model/persistent-conditions.model'
import { CodeHintComponent } from '../code-hint/code-hint.component'
import { ShipLogEditorComponent } from '../ship-log-editor/ship-log-editor.component'
import { ControlConfigs, WithFormControls } from '../../util'
import { KnownSignalsEditorComponent } from '../known-signals-editor/known-signals-editor.component'
import { PersistentConditionsEditorComponent } from '../persistent-conditions-editor/persistent-conditions-editor.component'
import { ShownPopupsEditorComponent } from '../shown-popups-editor/shown-popups-editor.component'

@Component({
  selector: 'app-save-editor',
  imports: [
    AsyncPipe,
    CodeHintComponent,
    FormsModule,
    KnownSignalsEditorComponent,
    MatAutocompleteModule,
    MatButtonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    PersistentConditionsEditorComponent,
    ReactiveFormsModule,
    ShipLogEditorComponent,
    ShownPopupsEditorComponent,
  ],
  templateUrl: './save-editor.component.html',
  styleUrl: './save-editor.component.scss',
  standalone: true,
})
export class SaveEditorComponent {
  protected readonly fb = inject(FormBuilder)

  protected readonly form = this.fb.group<ControlConfigs<SaveFile>>({
    loopCount: [0, Validators.required],
    knownFrequencies: this.fb.nonNullable.array([
      this.fb.nonNullable.control(true),
      this.fb.nonNullable.control(true),
      this.fb.nonNullable.control(false),
      this.fb.nonNullable.control(false),
      this.fb.nonNullable.control(false),
      this.fb.nonNullable.control(false),
      this.fb.nonNullable.control(false),
    ]),
    knownSignals: this.fb.nonNullable.record<boolean>(
      Object.fromEntries(
        Object.values(SignalName)
          .filter(v => typeof v !== 'string')
          .map(key => [key, false]),
      ),
    ) as AbstractControl<Record<number, boolean>>,
    dictConditions: this.fb.nonNullable.record<boolean>(
      Object.fromEntries(Object.keys(KnownConditions).map(key => [key, false])),
    ) as AbstractControl<Record<string, boolean>>,
    shipLogFactSaves: this.fb.nonNullable.record(
      Object.fromEntries(
        Object.keys(ShipLogFacts).map(key => [
          key,
          this.fb.nonNullable.group<ControlConfigs<ShipLogFactSave>>({
            id: [key, Validators.required],
            revealOrder: [-1, Validators.required],
            newlyRevealed: [false, Validators.required],
            read: [false, Validators.required],
          }),
        ]),
      ),
    ) as AbstractControl<Record<string, ShipLogFactSave>>,
    newlyRevealedFactIDs: this.fb.nonNullable.array<string>([]),
    lastDeathType: [DeathType.Default, Validators.required],
    burnedMarshmallowEaten: [0],
    fullTimeloops: [0, Validators.min(0)],
    perfectMarshmallowsEaten: [0, Validators.min(0)],
    warpedToTheEye: [false],
    secondsRemainingOnWarp: [0.0],
    loopCountOnParadox: [0],
    shownPopups: [StartupPopups.None],
    version: ['NONE'],
    ps5Activity_canResumeExpedition: [false],
    ps5Activity_availableShipLogCards: this.fb.nonNullable.array<string>([]),
    didRunInitGammaSetting: [true],
  })

  _ = this.form.valueChanges.subscribe(v => console.log(v))

  get knownFrequencies() {
    return this.form.get('knownFrequencies') as FormArray<FormControl<boolean>>
  }

  get dictConditions() {
    return this.form.get('dictConditions') as FormRecord<FormControl<boolean>>
  }

  get shipLogFactSaves() {
    return this.form.get('shipLogFactSaves') as FormRecord<
      FormGroup<WithFormControls<ShipLogFactSave>>
    >
  }

  get knownSignals() {
    return this.form.get('knownSignals') as FormRecord<FormControl<boolean>>
  }

  get newlyRevealedFactIDs() {
    return this.form.get('newlyRevealedFactIDs') as FormArray<FormControl<string>>
  }

  protected readonly currentFactIDs$ = () =>
    this.newlyRevealedFactIDs.valueChanges.pipe(
      startWith(this.newlyRevealedFactIDs.value),
      distinctUntilChanged(),
    )
  protected readonly filteredFactIDs$ = this.newlyRevealedFactIDs.valueChanges.pipe(
    startWith(this.newlyRevealedFactIDs.value),
    pairwise(),
    // recreate observables every time the length changes
    filter(([prev, curr]) => prev.length !== curr.length),
    // but always immediately start
    startWith(undefined),
    map(() =>
      this.newlyRevealedFactIDs.controls.map(control =>
        control.valueChanges.pipe(
          startWith(control.value),
          combineLatestWith(this.currentFactIDs$()),
          map(([value, ids]) =>
            // suggest matching known ship log fact ids that don't have controls yet
            Object.keys(ShipLogFacts).filter(
              option => option.toLowerCase().includes(value.toLowerCase()) && !ids.includes(option),
            ),
          ),
        ),
      ),
    ),
  )

  get ps5Activity_availableShipLogCards() {
    return this.form.get('ps5Activity_availableShipLogCards') as FormArray<FormControl<string>>
  }

  // TODO: proper error handling
  // TODO: ask for confirmation
  protected async openFile(event: Event) {
    console.log('reading file')

    // make sure controls in form arrays don't become invalid
    this.knownFrequencies.clear({ emitEvent: false })
    this.newlyRevealedFactIDs.clear({ emitEvent: false })
    this.ps5Activity_availableShipLogCards.clear({ emitEvent: false })

    // reset all persistent conditions
    Object.values(this.dictConditions.controls).forEach(c => c.setValue(false))

    const files = (event.target as HTMLInputElement).files
    if (files === null) return
    const file = files[0]
    const text = await file.text()
    console.log('read text:', text)
    const newValue = SaveFileJson.parse(text)

    // create controls in form arrays
    for (const _ of newValue.knownFrequencies)
      this.knownFrequencies.push(this.fb.nonNullable.control(false), { emitEvent: false })
    for (const _ of newValue.newlyRevealedFactIDs)
      this.newlyRevealedFactIDs.push(this.fb.nonNullable.control(''), { emitEvent: false })
    for (const _ of newValue.ps5Activity_availableShipLogCards)
      this.ps5Activity_availableShipLogCards.push(this.fb.nonNullable.control(''), {
        emitEvent: false,
      })

    this.form.patchValue(newValue)
  }

  protected async saveFile() {
    console.log('saving file', this.form.value)
    const jsonString = SaveFileJson.encode(SaveFile.parse(this.form.value))
    console.log('json string to save:', jsonString)
    saveAs(new Blob([jsonString], { type: 'application/json;charset=utf-8' }), 'data.owsave')
  }

  // because we track our form arrays by index, removing a control needs extra steps
  protected removeAt(array: FormArray, index: number) {
    const value = array.value
    // move item to delete to end of array (causes dom to update)
    array.setValue(
      value
        .slice(0, index)
        .concat(value.slice(index + 1))
        .concat(value[index]),
      { emitEvent: false },
    )
    // remove last item (doesn't need to update dom anymore)
    array.removeAt(value.length - 1)
  }

  protected readonly deathTypes = Object.values(DeathType)
    .filter(v => typeof v !== 'string')
    .map(v => ({
      value: v,
      name: DeathType[v],
    }))

  protected readonly vanillaFrequencies = [
    ['Default'],
    ['Outer Wilds Ventures'],
    ['Quantum Fluctuations'],
    ['Distress Beacon'],
    ['White Hole', '(unused)'],
    ['Hide and Seek'],
    ['Deep Space Radio'],
  ]
}
