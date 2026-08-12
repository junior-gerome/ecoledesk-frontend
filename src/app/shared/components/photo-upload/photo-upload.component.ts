import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '@app/core/configuration/api-endpoints.config';

interface PhotoUploadResponse {
  fileUrl: string;
}

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-3">

      <!-- Miniature photo d'identité -->
      <div class="relative flex-shrink-0 w-16 h-16 rounded-md border border-gray-300 dark:border-gray-600
                  bg-gray-50 dark:bg-gray-800 overflow-hidden shadow-sm">
        @if (photoUrl) {
          <img [src]="getPhotoUrl()" [alt]="label" class="w-full h-full object-cover" />
          <button
            type="button"
            (click)="removePhoto()"
            class="absolute inset-0 flex items-center justify-center
                   bg-black/40 opacity-0 hover:opacity-100 transition-opacity
                   text-white text-lg"
            title="Supprimer"
          >&times;</button>
        } @else {
          <div class="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
        }
      </div>

      <!-- Bouton + hint -->
      <div class="flex flex-col gap-1">
        <button
          type="button"
          (click)="fileInput.click()"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium
                 rounded-md border border-gray-300 dark:border-gray-600
                 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
                 hover:bg-gray-50 dark:hover:bg-gray-700
                 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          {{ photoUrl ? 'Changer' : label }}
        </button>
        <p class="form-hint">{{ hint }}</p>
      </div>

      <!-- Input fichier caché -->
      <input #fileInput type="file" accept="image/*" (change)="onFileSelected($event)" class="hidden" />
    </div>
  `,
})
export class PhotoUploadComponent {
  @Input() photoUrl: string | null = null;
  @Input() label = 'Ajouter une photo';
  @Input() hint = 'JPG, PNG (max 5MB)';
  @Input() uploadType = 'photos';
  @Output() photoUrlChange = new EventEmitter<string>();
  @Output() uploadError = new EventEmitter<string>();

  constructor(private http: HttpClient) {}

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', this.uploadType);

    this.http.post<PhotoUploadResponse>(API_ENDPOINTS.files.upload, formData).subscribe({
      next: (response) => {
        this.photoUrl = response.fileUrl;
        this.photoUrlChange.emit(response.fileUrl);
      },
      error: () => {
        this.uploadError.emit("La photo n'a pas pu etre chargee.");
      },
    });
  }

  removePhoto(): void {
    if (!this.photoUrl) return;
    this.http
      .delete(API_ENDPOINTS.files.delete(this.photoUrl))
      .subscribe({
        next: () => {
          this.photoUrl = null;
          this.photoUrlChange.emit('');
        },
        error: () => {
          this.uploadError.emit("La photo n'a pas pu etre supprimee.");
        },
      });
  }

  getPhotoUrl(): string {
    return API_ENDPOINTS.files.download(this.photoUrl ?? '');
  }
}
