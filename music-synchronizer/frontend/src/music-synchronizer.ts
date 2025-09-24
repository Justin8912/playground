import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import "./custom-components/form-view.js";
import "./custom-components/song-comparison-view.js";
import {getSynchronizationProposal, updateSynchronizationProposal} from "./controller/controller";
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
        ></song-comparison-view>
    </div>`
  }
  override render() {
    console.log("Rendering MusicSynchronizer, proposal:", this.synchronizationProposal);
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
    console.log(this.synchronizationProposal.proposedChangesId);
  }

  // TODO: Remove this
  async test() {
    this.synchronizationProposal = await getSynchronizationProposal(
        "spotify",
        "youtube",
        "justin",
        "justin",
        "test",
        "c075bb91-73bf-4d23-a53b-f526e7626781"
    );
  }

  /**
   * Handles the remove-song-mapping event emitted from song-comparison-view.
   * Removes the mapping from the current synchronizationProposal and updates the UI.
   */
  async handleRemoveSongMapping(event: CustomEvent) {
    const { sourceSongId, targetSongId } = event.detail;
    console.log("Got the event: ", sourceSongId, targetSongId);
    await updateSynchronizationProposal(
        this.synchronizationProposal.data.requestDetails.sourceService,
        this.synchronizationProposal.data.requestDetails.targetService,
        this.synchronizationProposal.data.requestDetails.sourceUser,
        this.synchronizationProposal.data.requestDetails.targetUser,
        this.synchronizationProposal.data.requestDetails.playlist,
        this.synchronizationProposal.proposedChangesId,
        "remove",
        sourceSongId,
        { videoId: targetSongId }
    )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'music-synchronizer': MusicSynchronizer;
  }
}
