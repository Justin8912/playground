import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import { tailwindStyles } from '../styles/shared-styles.js';

@customElement('waiting-view')
export class WaitingView extends LitElement {
  static override styles = [
    tailwindStyles,
    css`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .spinner {
        animation: spin 1s linear infinite;
      }
    `
  ];

  @property({type: String})
  message = 'Getting the list of proposed changes...';

  override render() {
    return html`
      <div class="block text-center p-8">
        <div class="flex flex-col items-center gap-6">
          <div class="spinner w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full"></div>
          <div class="text-lg text-gray-600 dark:text-gray-400 max-w-sm leading-relaxed">
            ${this.message}
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'waiting-view': WaitingView;
  }
}
