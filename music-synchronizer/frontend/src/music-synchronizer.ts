import {LitElement, html, css} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import "./custom-components/form-view.js";
import "./custom-components/song-comparison-view.js";
import "./custom-components/waiting-view.js";
import "./custom-components/failed-uploads-view.js";
import {getSynchronizationProposal, synchronizePlaylist} from "./controller/controller";
import {ProposedChangesRequestDetails, Song, SynchronizationProposal} from "./model/ControllerTypes";
import {proposedChangesId, requestDetails} from "./util/context";
import { provide } from '@lit/context';
import { tailwindStyles } from './styles/shared-styles.js';
import {res} from "./controller/dummy";

// Page type for explicit view switching
export type Page = "form" | "comparison" | "results";

@customElement('music-synchronizer')
export class MusicSynchronizer extends LitElement {
  static override styles = [
    tailwindStyles,
    css`
      :host {
        display: block;
        padding: 1rem;
        width: 100%;
        max-width: 60rem;
        min-width: 20rem;
        color: #222;
      }
      :host(.dark), :host([data-theme="dark"]) {
        background-color: #1a202c;
        color: #f3f3f3;
      }
    `
  ];

  @property()
  @state()
  synchronizationProposal: SynchronizationProposal = {} as SynchronizationProposal;
  @property()
  errorMessage: string = "";
  @state()
  isLoading: boolean = false;
  // @ts-ignore
  @provide({context: requestDetails})
  @state()
  requestDetails?: ProposedChangesRequestDetails;
  // @ts-ignore
  @provide({context: proposedChangesId})
  @state()
  proposedChangesId?: string;
  @state()
  currentPage: Page = "form";
  @state()
  failedSongs: Song[] = [];

  async handleFormSubmission(event: CustomEvent) {
    const payload = event.detail as ProposedChangesRequestDetails;
    this.errorMessage = "";
    this.isLoading = true;
    try {
      this.synchronizationProposal = await getSynchronizationProposal(payload);
      this.requestDetails = this.synchronizationProposal.data.requestDetails;
      this.proposedChangesId = this.synchronizationProposal.proposedChangesId;
      this.currentPage = "comparison";
    } catch (err: any) {
      this.errorMessage = err.message;
    }
    this.isLoading = false;
  }

  handleError(event: CustomEvent) {
    this.errorMessage = event.detail.message;
  }

  async handleProposalUpdate(event: CustomEvent) {
    const {proposedChanges} = event.detail;
    this.synchronizationProposal = {
      data: proposedChanges,
      proposedChangesId: this.synchronizationProposal.proposedChangesId
    }
  };

  async synchronizePlaylist() {
    this.isLoading = true;
    this.errorMessage = "";
    try {
      this.failedSongs = await synchronizePlaylist(
          this.requestDetails as ProposedChangesRequestDetails,
          this.synchronizationProposal.proposedChangesId
      );
      this.requestDetails = this.synchronizationProposal.data.requestDetails;
      this.currentPage = "results";
    } catch (err) {
      console.log(err);
      // @ts-ignore
      this.errorMessage = err.message;
    }
    this.synchronizationProposal = {} as SynchronizationProposal;
    this.isLoading = false;
  }

  handleRestart() {
    this.failedSongs = [];
    this.synchronizationProposal = {} as SynchronizationProposal;
    this.errorMessage = "";
    this.isLoading = false;
    this.currentPage = "form";
  }

  renderFormView() {
    return html`
      <div>
        <form-view 
          @form-submit=${this.handleFormSubmission}
          @form-error=${this.handleError}
        ></form-view>
      </div>`
  }

  renderSongComparisonView(proposal: SynchronizationProposal = this.synchronizationProposal) {
    return html`
    <div>
        <song-comparison-view 
          .synchronizationProposal=${proposal}
          @error=${this.handleError}
          @update-proposal=${this.handleProposalUpdate}
          @submit-proposal=${this.synchronizePlaylist}
        ></song-comparison-view>
    </div>`
  }

  renderFailedUploadsView() {
    return html`
          <failed-uploads-view
            .failedSongs=${this.failedSongs}
            .source=${this.requestDetails?.targetService || ""}
            @restart=${this.handleRestart}
          ></failed-uploads-view>
        `
  }

  renderWaitingView() {
    return html`
      <waiting-view></waiting-view>
    `
  }

  override render() {
    let pageContent: unknown;
    switch (this.currentPage) {
      case "form":
        pageContent = this.renderFormView();
        break;
      case "comparison":
        pageContent = this.renderSongComparisonView(this.synchronizationProposal);
        break;
      case "results":
        pageContent = this.renderFailedUploadsView();
        break;
      default:
        pageContent = html`<p>Unknown page</p>`;
    }
    return html`
      <div class="w-full max-w-screen-2xl rounded-md shadow p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        ${this.isLoading ? this.renderWaitingView() : html``}
        ${this.errorMessage ? html`<p class="mb-4 text-red-600 dark:text-red-400">${this.errorMessage}</p>` : html``}
        ${!this.isLoading ? pageContent : html``}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'music-synchronizer': MusicSynchronizer;
  }
}
