import { Component } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { ThemePickerComponent } from './components/theme-picker/theme-picker.component'
import { SaveEditorComponent } from './components/save-editor/save-editor.component'

@Component({
  selector: 'app-root',
  imports: [MatCardModule, ThemePickerComponent, SaveEditorComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
