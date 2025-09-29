import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Song } from '../model/ControllerTypes';
import './song-card-view.js';

@customElement('failed-uploads-view')
export class FailedUploadsView extends LitElement {
  static override styles = css`
    :host {
      display: block;
      padding: 1rem;
    }
    .songs {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    h2 {
      margin-bottom: 1rem;
    }
  `;

  @property({ type: Array })
  failedSongs: Song[] = [];

  private handleRestart() {
    this.dispatchEvent(new CustomEvent('restart', { bubbles: true, composed: true }));
  }

  override render() {
    return html`
      <div>
        <h2>Status Report</h2>
        ${this.failedSongs.length === 0
          ? html`<p>All songs were added successfully!</p>`
          : html`
              <div class="songs">
                ${this.failedSongs.map(song => html`
                  <song-card-view .song=${song}></song-card-view>
                `)}
              </div>
            `
        }
        <button @click=${this.handleRestart}>Start Over</button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'failed-uploads-view': FailedUploadsView;
  }
}

