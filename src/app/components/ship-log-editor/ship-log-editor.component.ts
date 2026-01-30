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
import { ShipLogFacts } from '../../model/ship-log.model'
import { AddToRecordComponent } from '../add-to-record/add-to-record.component'
import { Origin } from '../../model/origin.model'

@Component({
  selector: 'app-ship-log-editor',
  imports: [
    AddToRecordComponent,
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

  protected getFormGroup(key: string): FormGroup<WithFormControls<ShipLogFactSave>> {
    return this.form().get(key) as FormGroup<WithFormControls<ShipLogFactSave>>
  }

  protected addFact(name: string) {
    this.form().addControl(
      name,
      this.fb.nonNullable.group({
        id: [name, Validators.required],
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
  }

  protected readonly Object = Object
  protected readonly Origin = Origin
  protected readonly ShipLogFacts = new Map(Object.entries(ShipLogFacts))
  protected readonly shipLogFactIDs = Object.keys(ShipLogFacts)
}
