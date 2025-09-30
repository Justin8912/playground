import {LitElement, html, css} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import "./custom-components/form-view.js";
import "./custom-components/song-comparison-view.js";
import "./custom-components/waiting-view.js";
import "./custom-components/failed-uploads-view.js";
import {getSynchronizationProposal} from "./controller/controller";
import {ProposedChangesRequestDetails, Song, SynchronizationProposal} from "./model/ControllerTypes";
import {proposedChangesId, requestDetails} from "./util/context";
import { provide } from '@lit/context';
import { tailwindStyles } from './styles/shared-styles.js';
import {res} from "./controller/dummy";
import { renderButton } from './custom-components/button.js';


// Page type for explicit view switching
export type Page = "form" | "comparison" | "results";

@customElement('music-synchronizer')
export class MusicSynchronizer extends LitElement {
  static override styles = [
    tailwindStyles,
    css`
      :host {
        display: block;
        border: solid 0.1rem gray;
        padding: 1rem;
        max-width: 40rem;
        background-color: #fff;
        color: #222;
      }
      :host(.dark), :host([data-theme="dark"]) {
        background-color: #1a202c;
        color: #f3f3f3;
        border-color: #2d3748;
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
    const payload = event.detail;
    this.errorMessage = "";
    this.isLoading = true;
    try {
      this.synchronizationProposal = await getSynchronizationProposal(
          payload.sourceService,
          payload.targetService,
          payload.sourceUser,
          payload.targetUser,
          payload.playlistName
      );
      this.requestDetails = this.synchronizationProposal.data.requestDetails;
      this.proposedChangesId = this.synchronizationProposal.proposedChangesId;
      this.currentPage = "comparison";
    } catch (err: any) {
      this.errorMessage = err.message;
    }
    this.isLoading = false;
  }

  handleFormError(event: CustomEvent) {
    this.errorMessage = event.detail.message;
  }

  // TODO: Remove this
  async test() {
    this.synchronizationProposal = res
    this.requestDetails = this.synchronizationProposal.data.requestDetails;
    this.proposedChangesId = this.synchronizationProposal.proposedChangesId;
    this.currentPage = "comparison";
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
      console.log("Synchronizing playlist...");
      this.failedSongs = await synchronizePlaylist(
          this.synchronizationProposal.data.requestDetails.sourceService,
          this.synchronizationProposal.data.requestDetails.targetService,
          this.synchronizationProposal.data.requestDetails.sourceUser,
          this.synchronizationProposal.data.requestDetails.targetUser,
          this.synchronizationProposal.data.requestDetails.playlist,
          this.synchronizationProposal.proposedChangesId
      );
      // this.failedSongs = res.data.uncertainProposedChanges.map(row=>row.targetSong);
      this.requestDetails = this.synchronizationProposal.data.requestDetails;
      this.currentPage = "results";
    } catch (err) {
      console.log(err);
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
          @form-error=${this.handleFormError}
        ></form-view>
        <button @click=${this.test}>test</button>
      </div>`
  }

  renderSongComparisonView(proposal: SynchronizationProposal = this.synchronizationProposal) {
    return html`
    <div>
        <song-comparison-view 
          .synchronizationProposal=${proposal}
          @update-proposal=${this.handleProposalUpdate}
        ></song-comparison-view>
        ${renderButton("Submit Changes", this.synchronizePlaylist.bind(this))}
    </div>`
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
        pageContent = html`
          <failed-uploads-view
            .failedSongs=${this.failedSongs}
            .source=${this.requestDetails?.targetService || ""}
            @restart=${this.handleRestart}
          ></failed-uploads-view>
        `;
        break;
      default:
        pageContent = html`<p>Unknown page</p>`;
    }
    return html`
      <div class="rounded-md shadow p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
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
