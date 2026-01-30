import { Component, inject, input } from '@angular/core'
import { FormBuilder, FormControl, FormRecord, ReactiveFormsModule } from '@angular/forms'
import { KnownConditions } from '../../model/persistent-conditions.model'
import { Origin } from '../../model/origin.model'
import { CodeHintComponent } from '../code-hint/code-hint.component'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { AddToRecordComponent } from '../add-to-record/add-to-record.component'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'

@Component({
  selector: 'app-persistent-conditions-editor',
  imports: [
    AddToRecordComponent,
    CodeHintComponent,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
  ],
  templateUrl: './persistent-conditions-editor.component.html',
  styleUrl: './persistent-conditions-editor.component.scss',
  standalone: true,
})
export class PersistentConditionsEditorComponent {
  protected readonly fb = inject(FormBuilder)

  readonly form = input.required<FormRecord<FormControl<boolean>>>()

  protected readonly KnownConditions = new Map(Object.entries(KnownConditions))
  protected readonly knownConditionKeys = Object.keys(KnownConditions)
  protected readonly Object = Object
  protected readonly Origin = Origin
}
