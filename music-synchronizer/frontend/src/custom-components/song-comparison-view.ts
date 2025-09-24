import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {SynchronizationProposal} from "../model/ControllerTypes";
import './song-row-view'

@customElement('song-comparison-view')
export class SongComparisonView extends LitElement {
    @property({type: Object})
    synchronizationProposal: SynchronizationProposal = {} as SynchronizationProposal;

    override render() {
        const confidentProposedChanges = this.synchronizationProposal.data.confidentProposedChanges;
        const uncertainProposedChanges = this.synchronizationProposal.data.uncertainProposedChanges;
        
        if (!confidentProposedChanges.length && !uncertainProposedChanges.length) {
            return html`<div>No proposed changes found.</div>`;
        }

        return html`
            <div id="uncertain-proposed-changes">
                ${confidentProposedChanges.map(row => (
                    html`
                        <song-row-view
                            .synchronizationProposalRow=${row}
                            .sourceService=${this.synchronizationProposal.data.requestDetails.sourceService}
                            .targetService=${this.synchronizationProposal.data.requestDetails.targetService}
                        ></song-row-view>
                    `
                ))}
            </div>
            <div id="confident-proposed-changes">
                ${uncertainProposedChanges.map(row => (
                        html`
                        <song-row-view
                            .synchronizationProposalRow=${row}
                            .sourceService=${this.synchronizationProposal.data.requestDetails.sourceService}
                            .targetService=${this.synchronizationProposal.data.requestDetails.targetService}
                        ></song-row-view>
                    `
                ))}
            </div>
        `;
    }
}
