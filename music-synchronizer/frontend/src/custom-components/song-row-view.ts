import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ProposedChanges, ProposedChangesRequestDetails, Song} from "../model/ControllerTypes";
import './song-card-view';
import {updateSynchronizationProposal} from "../controller/controller";
import { consume } from '@lit/context';
import {requestDetails, proposedChangesId} from "../util/context";

@customElement('song-row-view')
export class SongRowView extends LitElement {
    static override styles = css`
      .comparison-row {
        display: flex;
        align-items: center;
        gap: 2rem;
        margin: 1rem 0;
        position: relative;
      }
      .arrow {
        font-size: 2rem;
        color: #1976d2;
        font-weight: bold;
      }
      .trash-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        margin-left: auto;
        display: flex;
        align-items: center;
      }
      .trash-icon {
        width: 1.5rem;
        height: 1.5rem;
        fill: #d32f2f;
        transition: fill 0.2s;
      }
      .trash-btn:hover .trash-icon {
        fill: #b71c1c;
      }
    `;

    @property({type: Object})
    synchronizationProposalRow!: { sourceSong: Song; targetSong: Song };

    @property({type: String})
    sourceService!: string;

    @property({type: String})
    targetService!: string;

    @consume({context: requestDetails})
    details?: ProposedChangesRequestDetails

    @consume({context: proposedChangesId})
    proposedChangesId?: string

    private dispatchProposalUpdate(proposedChanges: ProposedChanges<ProposedChangesRequestDetails>) {
        this.dispatchEvent(new CustomEvent('update-proposal', {
            detail: {proposedChanges},
            bubbles: true,
            composed: true
        }));
    }

    async handleSongUpdate(event: CustomEvent) {
        const {targetSongId} = event.detail;
        try {
            if (this.details && this.proposedChangesId) {
                console.log("Updating synchronization proposal...");
                const proposalUpdate = await updateSynchronizationProposal(
                    this.details.sourceService,
                    this.details.targetService,
                    this.details.sourceUser,
                    this.details.targetUser,
                    this.details.playlist,
                    this.proposedChangesId,
                    "update",
                    this.synchronizationProposalRow.sourceSong.videoId,
                    targetSongId
                )

                this.dispatchProposalUpdate(proposalUpdate);
            } else {
                console.error("Details and/or proposedChangesId is undefined.");
            }
        } catch (err) {
            console.log(err);
        }
    }

    async handleRemoveMapping(){
        try {
            if (this.details && this.proposedChangesId) {
                const proposedChanges = await updateSynchronizationProposal(
                    this.details.sourceService,
                    this.details.targetService,
                    this.details.sourceUser,
                    this.details.targetUser,
                    this.details.playlist,
                    this.proposedChangesId,
                    "remove",
                    this.synchronizationProposalRow.sourceSong.videoId,
                    this.synchronizationProposalRow.targetSong.videoId,
                )

                this.dispatchProposalUpdate(proposedChanges)
            }
        } catch (err) {
            console.log(err);
        }
    }

    renderSongComparisonView() {
        return html`
            <div class="comparison-row">
                <song-card-view 
                    .song=${this.synchronizationProposalRow.sourceSong} 
                    .source=${this.sourceService}
                    .isTargetCard=${false}
                ></song-card-view>
                <span class="arrow">→</span>
                <song-card-view 
                    .song=${this.synchronizationProposalRow.targetSong} 
                    .source=${this.targetService}
                    .isTargetCard=${true}
                    @replace-song=${this.handleSongUpdate}
                ></song-card-view>
                <button class="trash-btn" @click=${this.handleRemoveMapping} title="Remove mapping">
                  <svg class="trash-icon" viewBox="0 0 24 24">
                    <path d="M3 6h18v2H3V6zm2 3h14l-1.5 12.5c-.1.8-.8 1.5-1.6 1.5H8.1c-.8 0-1.5-.7-1.6-1.5L5 9zm5 2v8h2v-8h-2zm-4 0v8h2v-8H6zm8 0v8h2v-8h-2z"/>
                  </svg>
                </button>
            </div>
        `
    }

    override render() {
        return this.renderSongComparisonView();
    }
}
