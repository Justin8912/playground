import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('waiting-view')
export class WaitingView extends LitElement {
  static override styles = css`
    :host {
      display: block;
      text-align: center;
      padding: 2rem;
    }

    .waiting-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .message {
      font-size: 1.1rem;
      color: #555;
      max-width: 300px;
      line-height: 1.4;
    }
  `;

  @property({type: String})
  message = 'Please wait while the api hits the youtube quota...';

  override render() {
    return html`
      <div class="waiting-container">
        <div class="spinner"></div>
        <div class="message">
          ${this.message}
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
