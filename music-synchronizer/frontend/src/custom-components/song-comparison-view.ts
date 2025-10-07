import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {SynchronizationProposal} from "../model/ControllerTypes";
import './song-row-view'
import { tailwindStyles } from '../styles/shared-styles';
import {renderButton} from "./button";

@customElement('song-comparison-view')
export class SongComparisonView extends LitElement {
    static override styles = [tailwindStyles];
    
    @property({type: Object})
    synchronizationProposal: SynchronizationProposal = {} as SynchronizationProposal;

    private dispatchSubmission() {
        this.dispatchEvent(new CustomEvent("submit-proposal", {
            bubbles: true,
            composed: true
        }));
    }

    override render() {
        const confidentProposedChanges = this.synchronizationProposal.data.confidentProposedChanges;
        const uncertainProposedChanges = this.synchronizationProposal.data.uncertainProposedChanges;
        const sourceService = this.synchronizationProposal.data.requestDetails?.sourceService || '';
        const targetService = this.synchronizationProposal.data.requestDetails?.targetService || '';

        if (!confidentProposedChanges.length && !uncertainProposedChanges.length) {
                return html`<div class="text-base sm:text-lg text-center mt-8">No proposed changes found.</div>`;
        }

        return html`
            <div class="w-full">
                <div class="flex flex-row items-center font-bold text-xl sm:text-2xl mb-4 sm:mb-6 text-center">
                    <div class="flex-1 text-center capitalize">${sourceService}</div>
                    <div class="w-16 text-center"></div>
                    <div class="flex-1 text-center capitalize">${targetService}</div>
                </div>
                ${uncertainProposedChanges.length > 0 ? html`
                    <div class="mb-6 sm:mb-8">
                        <div class="text-base sm:text-lg font-semibold text-yellow-700 dark:text-yellow-400 text-center mb-2 sm:mb-4">
                            Uncertain Matches
                        </div>
                        <div class="flex flex-col gap-2 sm:gap-4">
                            ${uncertainProposedChanges.map(row => html`
                                <div class="flex flex-row items-center">
                                    <div class="flex-1">
                                        <song-row-view
                                            .synchronizationProposalRow=${row}
                                            .sourceService=${sourceService}
                                            .targetService=${targetService}
                                        ></song-row-view>
                                    </div>
                                </div>
                            `)}
                        </div>
                    </div>
                ` : ''}
                ${(uncertainProposedChanges.length > 0 && confidentProposedChanges.length > 0) ? html`<hr class="my-4 sm:my-6 border-t-2 border-gray-300 dark:border-gray-700" />` : ''}
                ${confidentProposedChanges.length > 0 ? html`
                    <div class="mb-6 sm:mb-8">
                        <div class="text-base sm:text-lg font-semibold text-blue-700 dark:text-blue-400 text-center mb-2 sm:mb-4">
                            Confident Matches
                        </div>
                        <div class="flex flex-col gap-2 sm:gap-4">
                            ${confidentProposedChanges.map(row => html`
                                <div class="flex flex-row items-center">
                                    <div class="flex-1">
                                        <song-row-view
                                            .synchronizationProposalRow=${row}
                                            .sourceService=${sourceService}
                                            .targetService=${targetService}
                                        ></song-row-view>
                                    </div>
                                </div>
                            `)}
                        </div>
                    </div>
                ` : ''}
            </div>
            <div class="mt-6 flex justify-center">
              ${renderButton("Submit Changes", this.dispatchSubmission.bind(this))}
            </div>
        `;
    }
}
