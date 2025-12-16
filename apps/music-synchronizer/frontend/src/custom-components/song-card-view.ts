// Utility to decode HTML entities
function decodeHtmlEntities(str: string): string {
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}
import {LitElement, html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {Song} from "../model/ControllerTypes";
import { tailwindStyles } from '../styles/shared-styles';

@customElement('song-card-view')
export class SongCardView extends LitElement {
  static override styles = [tailwindStyles];
  @property({type: Object})
  song: Song = { title: '', artists: [], videoId: '', description: '' };

  @property({type: String})
  source!: "youtube" | "spotify";

  @property({type: Boolean})
  isTargetCard!: boolean;

  @state()
  private isEditing = false;

  @state()
  private editValue = '';

  override render() {
    if (!this.song) return html`<div class="card">No song data</div>`;
    return html`
      <div class="card flex flex-col gap-2 p-4 rounded-lg shadow border bg-white dark:bg-gray-800 dark:border-gray-700 transition w-full max-w-full box-border">
        <div class="flex items-center mb-1">
          <span class="text-lg font-bold text-gray-900 dark:text-gray-100">
            <a
              href=${this.getSongLink(this.song)}
              target="_blank"
              rel="noopener"
              class="hover:text-blue-400 hover:underline transition-colors"
            >${decodeHtmlEntities(this.song.title)}</a>
          </span>
        </div>
        <div class="flex flex-wrap gap-1 mb-1">
          ${this.song.artists?.map(artist => html`
            <span class="px-2 py-0.5 rounded bg-gray-200 text-gray-700 text-xs dark:bg-gray-700 dark:text-gray-200">${decodeHtmlEntities(artist)}</span>
          `)}
        </div>
        ${this.renderVideoId()}
      </div>
    `;
  }

  private renderVideoId() {
    if (!this.song.videoId) return '';

    if (this.isTargetCard && this.isEditing) {
      return html`
        <div class="flex items-center gap-2 mt-2 text-xs text-gray-400 dark:text-gray-500 w-full">
          <span>ID:</span>
          <input 
            class="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            .value=${this.editValue}
            @input=${this.handleInputChange}
            @keydown=${this.handleKeyDown}
            placeholder="Enter new video ID"
            style="width: 8rem;"
          />
          <div class="flex gap-1">
            <button class="px-2 py-1 rounded bg-green-500 text-white text-xs hover:bg-green-600" @click=${this.handleSave}>✓</button>
            <button class="px-2 py-1 rounded bg-red-500 text-white text-xs hover:bg-red-600" @click=${this.handleCancel}>✗</button>
          </div>
        </div>
      `;
    }

    return html`
      <div class="flex items-center gap-2 mt-2 text-xs text-gray-400 dark:text-gray-500">
        <span>ID: ${this.song.videoId}</span>
        ${this.isTargetCard ? html`
          <button class="ml-2 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition edit-btn" @click=${this.handleEditClick} title="Edit Song ID">
            ✎
          </button>
        ` : ''}
      </div>
    `;
  }

  private handleEditClick = () => {
    this.isEditing = true;
    this.editValue = this.song.videoId;
  };

  private handleInputChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    this.editValue = input.value;
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      this.handleSave();
    } else if (e.key === 'Escape') {
      this.handleCancel();
    }
  };

  private handleCancel = () => {
    this.isEditing = false;
    this.editValue = '';
  };

  getSongLink(song: Song) {
    if (this.source?.toLowerCase() === "youtube") {
      return `https://youtube.com/watch?v=${song.videoId}`;
    } else if (this.source?.toLowerCase() === "spotify") {
      return `https://open.spotify.com/track/${song.videoId.split(":")[2]}`
    } else {
      return `https://google.com/search?q=${song.title}${song.artists?.join(', ')}`;
    }
  }

  private handleSave = () => {
    if (this.editValue.trim()) {
      this.dispatchEvent(new CustomEvent('replace-song', {
        detail: { targetSongId: this.editValue.trim() },
        bubbles: true,
        composed: true
      }));
    }
    this.isEditing = false;
  };
}
