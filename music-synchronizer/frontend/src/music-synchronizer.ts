import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import "./custom-components/form-view.js";
import "./custom-components/song-comparison-view.js";
import {getSynchronizationProposal, synchronizePlaylist, updateSynchronizationProposal} from "./controller/controller";
import {SynchronizationProposal} from "./model/ControllerTypes";

@customElement('music-synchronizer')
export class MusicSynchronizer extends LitElement {
  static override styles = css`
    :host {
      display: block;
      border: solid 0.1rem gray;
      padding: 1rem;
      max-width: 40rem;
    }
  `;

  @property()
  synchronizationProposal: SynchronizationProposal = {} as SynchronizationProposal;

  renderFormView() {
    return html`
      <div>
        <form-view @form-submit=${this.handleFormSubmission}></form-view>
        <button @click=${this.test}>test</button>
      </div>`
  }

  renderSongComparisonView(proposal: SynchronizationProposal = this.synchronizationProposal) {
    return html`
    <div>
        <song-comparison-view 
          .synchronizationProposal=${proposal}
          @remove-song-mapping=${this.handleRemoveSongMapping}
          @update-song-mapping=${this.handleReplaceSong}
        ></song-comparison-view>
      <button @click=${this.synchronizePlaylist}>Submit changes</button>
    </div>`
  }
  override render() {
    const pageView = this.synchronizationProposal.data ?
        this.renderSongComparisonView(this.synchronizationProposal)
        :
        this.renderFormView()

    return pageView
  }

  async handleFormSubmission(event: CustomEvent) {
    const payload = event.detail;
    this.synchronizationProposal = await getSynchronizationProposal(
        payload.sourceService,
        payload.targetService,
        payload.sourceUser,
        payload.targetUser,
        payload.playlistName
    );
  }

  // TODO: Remove this
  async test() {
    this.synchronizationProposal = await getSynchronizationProposal(
        "youtube",
        "spotify",
        "justin",
        "justin",
        "test",
        "f528ac1b-ff52-48c5-967e-9ce86db06a34"
    );
  }

  async handleRemoveSongMapping(event: CustomEvent) {
    const { sourceSongId, targetSongId } = event.detail;
    await updateSynchronizationProposal(
        this.synchronizationProposal.data.requestDetails.sourceService,
        this.synchronizationProposal.data.requestDetails.targetService,
        this.synchronizationProposal.data.requestDetails.sourceUser,
        this.synchronizationProposal.data.requestDetails.targetUser,
        this.synchronizationProposal.data.requestDetails.playlist,
        this.synchronizationProposal.proposedChangesId,
        "remove",
        sourceSongId,
        targetSongId
    )

    await this.refreshProposal();
  }

  async handleReplaceSong(event: CustomEvent) {
    const {sourceSongId, targetSongId} = event.detail;
    await updateSynchronizationProposal(
        this.synchronizationProposal.data.requestDetails.sourceService,
        this.synchronizationProposal.data.requestDetails.targetService,
        this.synchronizationProposal.data.requestDetails.sourceUser,
        this.synchronizationProposal.data.requestDetails.targetUser,
        this.synchronizationProposal.data.requestDetails.playlist,
        this.synchronizationProposal.proposedChangesId,
        "update",
        sourceSongId,
        targetSongId
    )

    await this.refreshProposal();
  }

  async refreshProposal() {
    this.synchronizationProposal = await getSynchronizationProposal(
        this.synchronizationProposal.data.requestDetails.sourceService,
        this.synchronizationProposal.data.requestDetails.targetService,
        this.synchronizationProposal.data.requestDetails.sourceUser,
        this.synchronizationProposal.data.requestDetails.targetUser,
        this.synchronizationProposal.data.requestDetails.playlist,
        this.synchronizationProposal.proposedChangesId
    );
  }

  async synchronizePlaylist() {
    await synchronizePlaylist(
        this.synchronizationProposal.data.requestDetails.sourceService,
        this.synchronizationProposal.data.requestDetails.targetService,
        this.synchronizationProposal.data.requestDetails.sourceUser,
        this.synchronizationProposal.data.requestDetails.targetUser,
        this.synchronizationProposal.data.requestDetails.playlist,
        this.synchronizationProposal.proposedChangesId
    )

    this.synchronizationProposal = {} as SynchronizationProposal;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'music-synchronizer': MusicSynchronizer;
  }
}
