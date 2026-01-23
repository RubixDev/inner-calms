import { Component, input, output } from '@angular/core'
import { FormGroup, ReactiveFormsModule } from '@angular/forms'
import { WithFormControls } from '../../util'
import { ShipLogFactSave } from '../../model/save-file.model'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { CodeHintComponent } from '../code-hint/code-hint.component'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'

@Component({
  selector: 'app-ship-log-fact-editor',
  imports: [
    CodeHintComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
  ],
  templateUrl: './ship-log-fact-editor.component.html',
  styleUrl: './ship-log-fact-editor.component.scss',
  standalone: true,
})
export class ShipLogFactEditorComponent {
  readonly form = input.required<FormGroup<WithFormControls<ShipLogFactSave>>>()

  readonly delete = output()
}
