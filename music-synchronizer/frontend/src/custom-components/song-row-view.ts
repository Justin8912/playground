import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ProposedChanges, ProposedChangesRequestDetails, Song} from "../model/ControllerTypes";
import './song-card-view';
import {updateSynchronizationProposal} from "../controller/controller";
import { consume } from '@lit/context';
import {requestDetails, proposedChangesId} from "../util/context";
import { tailwindStyles } from '../styles/shared-styles';

@customElement('song-row-view')
export class SongRowView extends LitElement {
    static override styles = [tailwindStyles];
    
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

    private dispatchError(message: string) {
        this.dispatchEvent(new CustomEvent('error', {
            detail: {message},
            bubbles: true,
            composed: true
        }))
    }

    async handleSongUpdate(event: CustomEvent) {
        const {targetSongId} = event.detail;
        try {
            if (this.details && this.proposedChangesId) {
                console.log("Updating synchronization proposal...");
                const proposalUpdate = await updateSynchronizationProposal(
                    this.details,
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
            // @ts-ignore
            this.dispatchError("Failed to update song: " + err.message as string);
        }
    }

    async handleRemoveMapping(){
        try {
            if (this.details && this.proposedChangesId) {
                const proposedChanges = await updateSynchronizationProposal(
                    this.details,
                    this.proposedChangesId,
                    "remove",
                    this.synchronizationProposalRow.sourceSong.videoId,
                    this.synchronizationProposalRow.targetSong.videoId,
                )

                this.dispatchProposalUpdate(proposedChanges)
            }
        } catch (err) {
            // @ts-ignore
            this.dispatchError("Failed to delete song: " + err.message as string);
        }
    }

    renderSongComparisonView() {
        return html`
            <div class="flex flex-row w-full my-4">
                <div class="flex-1 flex items-center justify-center">
                    <song-card-view 
                        .song=${this.synchronizationProposalRow.sourceSong} 
                        .source=${this.sourceService}
                        .isTargetCard=${false}
                    ></song-card-view>
                </div>
                <div class="w-16 flex items-center justify-center">
                    <span class="text-2xl font-bold text-blue-700">→</span>
                </div>
                <div class="flex-1 flex justify-center">
                    <song-card-view 
                        .song=${this.synchronizationProposalRow.targetSong} 
                        .source=${this.targetService}
                        .isTargetCard=${true}
                        @replace-song=${this.handleSongUpdate}
                    ></song-card-view>
                    <button class="ml-2 bg-transparent border-none cursor-pointer flex items-center" @click=${this.handleRemoveMapping} title="Remove mapping">
                      <svg class="w-6 h-6 fill-red-600 transition-colors hover:fill-red-800" viewBox="0 0 24 24">
                        <path d="M3 6h18v2H3V6zm2 3h14l-1.5 12.5c-.1.8-.8 1.5-1.6 1.5H8.1c-.8 0-1.5-.7-1.6-1.5L5 9zm5 2v8h2v-8h-2zm-4 0v8h2v-8H6zm8 0v8h2v-8h-2z"/>
                      </svg>
                    </button>
                </div>
            </div>
        `
    }

    override render() {
        return this.renderSongComparisonView();
    }
}
