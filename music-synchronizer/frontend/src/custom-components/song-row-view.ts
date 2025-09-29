import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Song} from "../model/ControllerTypes";
import './song-card-view';

@customElement('song-row-view')
export class SongRowView extends LitElement {
    static override styles = css`
      .comparison-row {
        display: flex;
        align-items: center;
        gap: 2rem;
        margin: 1rem 0;
        position: relative;
      }
      .arrow {
        font-size: 2rem;
        color: #1976d2;
        font-weight: bold;
      }
      .trash-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        margin-left: auto;
        display: flex;
        align-items: center;
      }
      .trash-icon {
        width: 1.5rem;
        height: 1.5rem;
        fill: #d32f2f;
        transition: fill 0.2s;
      }
      .trash-btn:hover .trash-icon {
        fill: #b71c1c;
      }
    `;

    @property({type: Object})
    synchronizationProposalRow!: { sourceSong: Song; targetSong: Song };

    @property({type: String})
    sourceService!: string;

    @property({type: String})
    targetService!: string;

    private handleRemoveMapping() {
        this.dispatchEvent(new CustomEvent('remove-song-mapping', {
            detail: {
                sourceSongId: this.synchronizationProposalRow.sourceSong.videoId,
                targetSongId: this.synchronizationProposalRow.targetSong.videoId
            },
            bubbles: true,
            composed: true
        }));
    }

    private handleSongUpdate(event: CustomEvent) {
        this.dispatchEvent(new CustomEvent('update-song-mapping', {
            detail: {
                sourceSongId: this.synchronizationProposalRow.sourceSong.videoId,
                targetSongId: event.detail.newSongId
            },
            bubbles: true,
            composed: true
        }));
    }

    renderSongComparisonView() {
        return html`
            <div class="comparison-row">
                <song-card-view 
                    .song=${this.synchronizationProposalRow.sourceSong} 
                    .source=${this.sourceService}
                    .isTargetCard=${false}
                ></song-card-view>
                <span class="arrow">→</span>
                <song-card-view 
                    .song=${this.synchronizationProposalRow.targetSong} 
                    .source=${this.targetService}
                    .isTargetCard=${true}
                    @replace-song=${this.handleSongUpdate}
                ></song-card-view>
                <button class="trash-btn" @click=${this.handleRemoveMapping} title="Remove mapping">
                  <svg class="trash-icon" viewBox="0 0 24 24">
                    <path d="M3 6h18v2H3V6zm2 3h14l-1.5 12.5c-.1.8-.8 1.5-1.6 1.5H8.1c-.8 0-1.5-.7-1.6-1.5L5 9zm5 2v8h2v-8h-2zm-4 0v8h2v-8H6zm8 0v8h2v-8h-2z"/>
                  </svg>
                </button>
            </div>
        `
    }

    override render() {
        console.log(this.synchronizationProposalRow)
        return this.renderSongComparisonView();
    }
}
