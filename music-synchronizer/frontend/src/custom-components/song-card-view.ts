import {LitElement, html, css} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {Song} from "../model/ControllerTypes";

@customElement('song-card-view')
export class SongCardView extends LitElement {
  static override styles = css`
    .card {
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 1rem;
      background: #f9f9f9;
      min-width: 180px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.04);
      position: relative;
    }
    .title {
      font-weight: bold;
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }
    .artists {
      color: #555;
      font-size: 0.95rem;
      margin-bottom: 0.5rem;
    }
    .description {
      font-size: 0.9rem;
      color: #888;
    }
    .video-id {
      font-size: 0.85rem;
      color: #aaa;
      margin-top: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .edit-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 2px;
      color: #666;
      opacity: 0.7;
      transition: opacity 0.2s;
    }
    .edit-btn:hover {
      opacity: 1;
    }
    .edit-input {
      flex: 1;
      padding: 4px 6px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 0.85rem;
      min-width: 0;
    }
    .edit-actions {
      display: flex;
      gap: 4px;
    }
    .save-btn, .cancel-btn {
      padding: 2px 6px;
      border: none;
      border-radius: 3px;
      font-size: 0.8rem;
      cursor: pointer;
    }
    .save-btn {
      background: #4CAF50;
      color: white;
    }
    .cancel-btn {
      background: #f44336;
      color: white;
    }
    .save-btn:hover {
      background: #45a049;
    }
    .cancel-btn:hover {
      background: #da190b;
    }
  `;

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
      <div class="card">
        <div class="title"><a href=${this.getSongLink(this.song)}>${this.song.title}</a></div>
        <div class="artists">${this.song.artists?.join(', ')}</div>
        ${this.renderVideoId()}
      </div>
    `;
  }

  private renderVideoId() {
    if (!this.song.videoId) return '';

    if (this.isTargetCard && this.isEditing) {
      return html`
        <div class="video-id">
          ID: 
          <input 
            class="edit-input" 
            .value=${this.editValue}
            @input=${this.handleInputChange}
            @keydown=${this.handleKeyDown}
            placeholder="Enter new video ID"
          />
          <div class="edit-actions">
            <button class="save-btn" @click=${this.handleSave}>✓</button>
            <button class="cancel-btn" @click=${this.handleCancel}>✗</button>
          </div>
        </div>
      `;
    }

    return html`
      <div class="video-id">
        ID: ${this.song.videoId}
        ${this.isTargetCard ? html`
          <button class="edit-btn" @click=${this.handleEditClick} title="Edit Song ID">
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

  private handleSave = () => {
    if (this.editValue.trim()) {
      this.dispatchEvent(new CustomEvent('replace-song', {
        detail: { newSongId: this.editValue.trim() },
        bubbles: true,
        composed: true
      }));
    }
    this.isEditing = false;
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
}
