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


// Page type for explicit view switching
export type Page = "form" | "comparison" | "results";

@customElement('music-synchronizer')
export class MusicSynchronizer extends LitElement {
  static override styles = css`
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    :host {
      display: block;
      border: solid 0.1rem gray;
      padding: 1rem;
      max-width: 40rem;
    }
  `;

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

  // TODO: Remove this
  async test() {
    this.synchronizationProposal = await getSynchronizationProposal(
        "spotify",
        "youtube",
        "justin",
        "justin",
        "test",
        "test"
    );
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

  async refreshProposal() {
    this.isLoading = true;

    try {
      this.synchronizationProposal = await getSynchronizationProposal(
          this.synchronizationProposal.data.requestDetails.sourceService,
          this.synchronizationProposal.data.requestDetails.targetService,
          this.synchronizationProposal.data.requestDetails.sourceUser,
          this.synchronizationProposal.data.requestDetails.targetUser,
          this.synchronizationProposal.data.requestDetails.playlist,
          this.synchronizationProposal.proposedChangesId
      );
      this.requestDetails = this.synchronizationProposal.data.requestDetails;
    } catch (err) {
      console.log(err);
    }
    this.isLoading = false;
  }

  async synchronizePlaylist() {
    this.isLoading = true;
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
        <p class="bg-red-500">asdfasdf</p>
        <form-view @form-submit=${this.handleFormSubmission}></form-view>
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
        <button @click=${this.synchronizePlaylist}>Submit changes</button>
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
            @restart=${this.handleRestart}
          ></failed-uploads-view>
        `;
        break;
      default:
        pageContent = html`<p>Unknown page</p>`;
    }
    return html`
      ${this.isLoading ? this.renderWaitingView() : html``}
      <p>${this.errorMessage}</p>
      ${!this.isLoading ? pageContent : html``}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'music-synchronizer': MusicSynchronizer;
  }
}
