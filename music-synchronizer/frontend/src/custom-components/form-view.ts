import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import { tailwindStyles } from '../styles/shared-styles.js';
import {renderButton} from "./button";

@customElement('form-view')
export class FormView extends LitElement {
    static override styles = [tailwindStyles];

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

    private handleInputChange(e: Event) {
        const target = e.target as HTMLInputElement | HTMLSelectElement;
        const { name, value } = target;
        // @ts-ignore
        this[name] = value;
    }

    private renderServiceDropdown(label: string, value: "Spotify" | "Youtube", name: string) {
        return html`
          <div class="input-row flex flex-col gap-1 mb-4">
            <label class="font-medium text-gray-700 dark:text-gray-100 mb-1">${label}</label>
            <select
              class="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition"
              .value=${value}
              name=${name}
              @change=${this.handleInputChange}
            >
              <option value="Spotify">Spotify</option>
              <option value="Youtube">Youtube</option>
            </select>
          </div>
        `;
    }

    private renderUserInput(label: string, value: string, name: string) {
        return html`
          <div class="input-row flex flex-col gap-1 mb-4">
            <label class="font-medium text-gray-700 dark:text-gray-100 mb-1">${label}</label>
            <input
              type="text"
              class="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition"
              .value=${value}
              name=${name}
              @input=${this.handleInputChange}
            />
          </div>
        `;
    }

    override render() {
        return html`
            <div class="input-section">
                ${this.renderServiceDropdown("Source Service", this.sourceService, "sourceService")}
                ${this.renderServiceDropdown("Target Service", this.targetService, "targetService")}
                ${this.renderUserInput("Source User", this.sourceUser, "sourceUser")}
                ${this.renderUserInput("Target User", this.targetUser, "targetUser")}
                ${this.renderUserInput("Playlist Name", this.playlistName, "playlistName")}
                ${renderButton("submit", this.handleSubmit.bind(this))}
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
        this.emitError(errors.join("\n"));
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
      bubbles: true,
      composed: false
    }));
  }

  emitError(message: string) {
    this.dispatchEvent(new CustomEvent('form-error', {
      detail: { message },
      bubbles: true,
      composed: false
    }));
    }
}
