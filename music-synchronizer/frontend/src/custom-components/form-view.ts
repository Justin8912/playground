import {LitElement, html, css} from 'lit';
import {customElement, state} from 'lit/decorators.js';

@customElement('form-view')
export class FormView extends LitElement {
    static override styles = css`
    .input-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .input-row {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .input-row label {
      font-weight: 500;
      margin-bottom: 0;
      min-width: 10rem;
    }
    .input-row select,
    .input-row input {
      padding: .8rem;
      font-size: 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: #fafafa;
      flex: 1;
    }
    .submit-btn {
      margin-top: 2rem;
      padding: 0.8rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      color: #fff;
      background: #1976d2;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .submit-btn:hover {
      background: #1565c0;
    }
  `;

    @state()
    sourceService: "Spotify" | "Youtube" = "Spotify";
    @state()
    targetService: "Spotify" | "Youtube" = "Youtube";
    @state()
    sourceUser: string = "";
    @state()
    targetUser: string = "";
    @state()
    playlistName: string = "";

    private handleSourceServiceChange(e: Event) {
        const value = (e.target as HTMLSelectElement).value as "Spotify" | "Youtube";
        this.sourceService = value;
    }

    private handleTargetServiceChange(e: Event) {
        const value = (e.target as HTMLSelectElement).value as "Spotify" | "Youtube";
        this.targetService = value;
    }

    private handleSourceUserInput(e: Event) {
        this.sourceUser = (e.target as HTMLInputElement).value;
    }

    private handleTargetUserInput(e: Event) {
        this.targetUser = (e.target as HTMLInputElement).value;
    }

    private handlePlaylistNameInput(e: Event) {
        this.playlistName = (e.target as HTMLInputElement).value;
    }

    private renderServiceDropdown(label: string, value: "Spotify" | "Youtube", onChange: (e: Event) => void) {
        return html`
          <div class="input-row">
            <label>${label}</label>
            <select
              .value=${value}
              @change=${onChange}
            >
              <option value="Spotify">Spotify</option>
              <option value="Youtube">Youtube</option>
            </select>
          </div>
        `;
    }

    private renderUserInput(label: string, value: string, onInput: (e: Event) => void) {
        return html`
          <div class="input-row">
            <label>${label}</label>
            <input
              type="text"
              .value=${value}
              @input=${onInput}
            />
          </div>
        `;
    }

    override render() {
        return html`
      <div class="input-sestatection">
        ${this.renderServiceDropdown("Source Service:", this.sourceService, this.handleSourceServiceChange)}
        ${this.renderServiceDropdown("Target Service:", this.targetService, this.handleTargetServiceChange)}
        ${this.renderUserInput("Source User:", this.sourceUser, this.handleSourceUserInput)}
        ${this.renderUserInput("Target User:", this.targetUser, this.handleTargetUserInput)}
        ${this.renderUserInput("Playlist Name:", this.playlistName, this.handlePlaylistNameInput)}
        <button class="submit-btn" @click=${this.handleSubmit}>Submit</button>
      </div>
    `;
    }

    private handleSubmit(e: Event) {
      e.preventDefault();
      const validServices = ["Spotify", "Youtube"];
      const errors: string[] = [];

      if (!validServices.includes(this.sourceService)) {
        errors.push("Source service must be Spotify or Youtube.");
      }
      if (!validServices.includes(this.targetService)) {
        errors.push("Target service must be Spotify or Youtube.");
      }
      if (!this.sourceUser.trim()) {
        errors.push("Source user is required.");
      }
      if (!this.targetUser.trim()) {
        errors.push("Target user is required.");
      }

      if (errors.length > 0) {
        alert(errors.join("\n"));
        return;
      }
        this.emitEvent({
            sourceService: this.sourceService,
            targetService: this.targetService,
            sourceUser: this.sourceUser,
            targetUser: this.targetUser,
            playlistName: this.playlistName
        });
    }

    emitEvent(detail: Object) {
        this.dispatchEvent(new CustomEvent('form-submit', {
            detail,
            bubbles: true,      // allows the event to bubble up through the DOM
            composed: false      // allows the event to cross shadow DOM boundaries
        }));
    }
}
