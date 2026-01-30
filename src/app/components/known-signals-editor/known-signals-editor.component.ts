import { Component, inject, input } from '@angular/core'
import { FormBuilder, FormControl, FormRecord, ReactiveFormsModule } from '@angular/forms'
import { SignalName } from '../../model/save-file.model'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { CodeHintComponent } from '../code-hint/code-hint.component'
import { MatIconModule } from '@angular/material/icon'
import { AddToRecordComponent } from '../add-to-record/add-to-record.component'
import { MatButtonModule } from '@angular/material/button'

@Component({
  selector: 'app-known-signals-editor',
  imports: [
    AddToRecordComponent,
    CodeHintComponent,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
  ],
  templateUrl: './known-signals-editor.component.html',
  styleUrl: './known-signals-editor.component.scss',
  standalone: true,
})
export class KnownSignalsEditorComponent {
  protected readonly fb = inject(FormBuilder)

  readonly form = input.required<FormRecord<FormControl<boolean>>>()

  protected isValid(value: string): boolean {
    return /^\d+$/.test(value)
  }

  protected readonly Number = Number
  protected readonly Object = Object
  protected readonly SignalName = SignalName
  protected readonly signalNameKeys = Object.values(SignalName)
    .filter(key => typeof key !== 'string')
    .map(key => key.toString())
}
