import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Song } from '../model/ControllerTypes';
import './song-card-view.js';
import { tailwindStyles } from '../styles/shared-styles';

@customElement('failed-uploads-view')
export class FailedUploadsView extends LitElement {
  static override styles = [tailwindStyles];

  @property({ type: Array })
  failedSongs: Song[] = [];

  @property({ type: String })
  source: string = "";

  private handleRestart() {
    this.dispatchEvent(new CustomEvent('restart', { bubbles: true, composed: true }));
  }

  override render() {
    return html`
      <div class="p-6 rounded-lg shadow bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        <h2 class="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">Status Report</h2>
        ${this.failedSongs.length === 0
          ? html`<p class="text-green-600 dark:text-green-400 font-semibold">All songs were added successfully!</p>`
          : html`
              <div class="flex flex-col gap-4 mb-4">
                ${this.failedSongs.map(song => html`
                  <song-card-view .song=${song} .source=${this.source}></song-card-view>
                `)}
              </div>
            `
        }
        <button
          @click=${this.handleRestart}
          class="mt-2 px-5 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition"
        >
          Start Over
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'failed-uploads-view': FailedUploadsView;
  }
}

